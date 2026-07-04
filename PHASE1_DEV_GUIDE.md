# Phase 1 开发指南 — 4 个核心功能

> **此文件供 mimo（AI 编程助手）读取执行。每个 Task 独立可交付。**
>
> **执行顺序**：Task 1 → Task 2 → Task 3 → Task 4
>
> **强制规则**：
> 1. 每个 Task 完成后运行 `bundle exec rspec` + `npx tsc --noEmit`，确保 0 errors
> 2. 前端开发前通过 Ant Design MCP Server 查询组件 API（见 `.mimocode/instructions.md`）
> 3. antd v6 注意事项：`Space direction="vertical"`（不是 `orientation`）、`Modal styles.body`（不是 `bodyStyle`）、`destroyOnHidden`（不是 `destroyOnClose`）
> 4. 不要创建多余的 .md 文件，文档只更新 `docs/` 下已有的

---

## Task 1：全局搜索（Cmd+K 命令面板）

### 目标
用户在后台任意页面按 `Cmd+K`（Mac）/ `Ctrl+K`（Windows），弹出命令面板，可：
1. 搜索资源记录（如文章、用户）→ 点击跳转详情
2. 快速跳转菜单项（如"用户管理"、"权限管理"）
3. 快捷操作（如"新建文章"、"导出数据"）

### 后端实现

#### 1.1 创建搜索控制器

**文件**：`app/controllers/admin/search_controller.rb`

```ruby
module Admin
  class SearchController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    # GET /admin/search?q=keyword
    def index
      query = params[:q].to_s.strip
      results = []

      if query.present?
        # 遍历所有 DSL 模型，在 searchable 字段中模糊匹配
        Zen.searchable_models.each do |model_class|
          results.concat(search_in_model(model_class, query))
        end
      end

      # 补充菜单快捷跳转
      menu_items = search_menu_items(query)

      render json: {
        records: results.first(20),
        menus: menu_items,
        actions: quick_actions(query)
      }
    end

    private

    def search_in_model(model_class, query)
      searchable_fields = model_class.zen_display_config.dig(:list, :searchable_fields)
      return [] unless searchable_fields.is_a?(Array) && searchable_fields.present?

      # 构建 OR 查询
      conditions = searchable_fields.map { |f| "#{f} ILIKE :q" }.join(" OR ")
      records = model_class.where(conditions, q: "%#{query}%").limit(5)

      records.map do |record|
        {
          id: record.id,
          model: model_class.name,
          title: record.send(searchable_fields.first).to_s,
          subtitle: model_class.model_name.human,
          url: "/admin/#{model_class.model_name.collection}/#{record.id}"
        }
      end
    rescue => e
      Rails.logger.debug { "[Search] #{model_class} error: #{e.message}" }
      []
    end

    def search_menu_items(query)
      [
        { title: "仪表盘", url: "/admin/dashboard", icon: "dashboard" },
        { title: "用户管理", url: "/admin/users", icon: "users" },
        { title: "角色管理", url: "/admin/roles", icon: "team" },
        { title: "权限管理", url: "/admin/permissions", icon: "safety" },
        { title: "API Key", url: "/admin/api_keys", icon: "key" },
        { title: "审计日志", url: "/admin/audit_logs", icon: "audit" },
      ].select { |m| m[:title].include?(query) }
    end

    def quick_actions(query)
      actions = [
        { title: "新建文章", url: "/admin/articles/new", icon: "plus", category: "action" },
        { title: "导出数据", url: "/admin/exports", icon: "export", category: "action" },
      ]
      query.present? ? actions.select { |a| a[:title].include?(query) } : actions
    end
  end
end
```

#### 1.2 注册可搜索模型

**文件**：`lib/zen/model_dsl.rb`（在模块末尾添加类方法）

```ruby
# 在 Zen module 中添加
module Zen
  # 获取所有声明了 searchable 字段的 DSL 模型
  def self.searchable_models
    ApplicationRecord.descendants.select do |model|
      model.respond_to?(:zen_display_config) &&
        model.zen_display_config.is_a?(Hash) &&
        model.zen_display_config[:list].is_a?(Hash) &&
        model.zen_display_config[:list][:searchable_fields].is_a?(Array) &&
        model.zen_display_config[:list][:searchable_fields].present?
    end
  end
end
```

#### 1.3 添加路由

**文件**：`config/routes.rb`

在 `namespace :admin` 块内添加：
```ruby
get "search", to: "search#index"
```

### 前端实现

#### 1.4 创建命令面板组件

**文件**：`app/frontend/components/admin/CommandPalette.tsx`

```tsx
import { Modal, Input, List, Typography, Spin, Empty } from 'antd'
import { SearchOutlined, AppstoreOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import { useState, useEffect, useCallback, useRef } from 'react'

const { Text } = Typography

interface SearchResult {
  id: number
  model: string
  title: string
  subtitle: string
  url: string
}

interface MenuItem {
  title: string
  url: string
  icon: string
}

interface QuickAction {
  title: string
  url: string
  icon: string
  category: string
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<SearchResult[]>([])
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [actions, setActions] = useState<QuickAction[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<any>(null)

  // 防抖搜索
  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setRecords([])
      setMenus([])
      setActions([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/admin/search?q=${encodeURIComponent(q)}`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      })
      if (res.ok) {
        const data = await res.json()
        setRecords(data.records || [])
        setMenus(data.menus || [])
        setActions(data.actions || [])
      }
    } catch {
      // 静默失败
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200)
    return () => clearTimeout(timer)
  }, [query, search])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  // 键盘导航
  const allItems = [...menus, ...actions, ...records]
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, allItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && allItems[activeIndex]) {
      e.preventDefault()
      handleSelect(allItems[activeIndex])
    }
  }

  const handleSelect = (item: any) => {
    if (item.url) {
      router.visit(item.url)
      onClose()
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      styles={{ body: { padding: 0 } }}
      closable={false}
      maskClosable
      style={{ top: 100 }}
    >
      <div onKeyDown={handleKeyDown}>
        <Input
          ref={inputRef}
          size="large"
          placeholder="搜索记录、页面、操作..."
          prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />}
          value={query}
          onChange={e => setQuery(e.target.value)}
          bordered={false}
          style={{ padding: '16px 20px' }}
        />

        {loading && <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>}

        {!loading && query && allItems.length === 0 && (
          <Empty description="无匹配结果" style={{ padding: 24 }} />
        )}

        {!loading && (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {menus.length > 0 && (
              <List
                size="small"
                header={<Text type="secondary" style={{ fontSize: 12, padding: '0 20px' }}>页面</Text>}
                dataSource={menus}
                renderItem={(item, index) => (
                  <List.Item
                    style={{
                      padding: '10px 20px',
                      cursor: 'pointer',
                      background: activeIndex === index ? 'rgba(22,119,255,0.08)' : 'transparent',
                    }}
                    onClick={() => handleSelect(item)}
                  >
                    <Text>{item.title}</Text>
                  </List.Item>
                )}
              />
            )}
            {actions.length > 0 && (
              <List
                size="small"
                header={<Text type="secondary" style={{ fontSize: 12, padding: '0 20px' }}>操作</Text>}
                dataSource={actions}
                renderItem={(item, index) => (
                  <List.Item
                    style={{
                      padding: '10px 20px',
                      cursor: 'pointer',
                      background: activeIndex === menus.length + index ? 'rgba(22,119,255,0.08)' : 'transparent',
                    }}
                    onClick={() => handleSelect(item)}
                  >
                    <Text>{item.title}</Text>
                  </List.Item>
                )}
              />
            )}
            {records.length > 0 && (
              <List
                size="small"
                header={<Text type="secondary" style={{ fontSize: 12, padding: '0 20px' }}>记录</Text>}
                dataSource={records}
                renderItem={(item, index) => (
                  <List.Item
                    style={{
                      padding: '10px 20px',
                      cursor: 'pointer',
                      background: activeIndex === menus.length + actions.length + index ? 'rgba(22,119,255,0.08)' : 'transparent',
                    }}
                    onClick={() => handleSelect(item)}
                  >
                    <div>
                      <Text strong>{item.title}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>{item.subtitle}</Text>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </div>
        )}

        <div style={{ padding: '8px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 16, fontSize: 12 }}>
          <Text type="secondary">↑↓ 导航</Text>
          <Text type="secondary">↵ 选择</Text>
          <Text type="secondary">Esc 关闭</Text>
        </div>
      </div>
    </Modal>
  )
}
```

#### 1.5 全局键盘监听 + 挂载

**文件**：`app/frontend/layouts/AdminLayout.tsx`

在组件内添加：
```tsx
import CommandPalette from '@/components/admin/CommandPalette'
import { useState, useEffect } from 'react'

// 在 AdminLayout 组件内：
const [paletteOpen, setPaletteOpen] = useState(false)

useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setPaletteOpen(true)
    }
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [])

// 在 return 的 JSX 末尾（</ProLayout> 之后，</div> 之前）：
<CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
```

### 验收标准
- [ ] `Cmd+K` / `Ctrl+K` 在任意 admin 页面弹出命令面板
- [ ] 输入关键词可搜索 Article 和 Comment 记录（这俩模型有 searchable 配置）
- [ ] 搜索"用户"能匹配到"用户管理"菜单项
- [ ] ↑↓ 键导航，Enter 跳转，Esc 关闭
- [ ] `bundle exec rspec` 全通过
- [ ] `npx tsc --noEmit` 0 errors

---

## Task 2：Dashboard 统计卡片 + 图表系统

### 目标
将 Dashboard 从静态欢迎页改为数据驱动的统计面板：
1. 4 个统计卡片（用户数、文章数、评论数、今日新增）
2. 1 个趋势图表（近 30 天文章发布趋势折线图）
3. 1 个最近活动表格（最新 5 条审计日志）
4. 保留快速开始和文档链接（移到底部）

### 后端实现

#### 2.1 修改 Dashboard 控制器

**文件**：`app/controllers/admin/dashboard_controller.rb`

```ruby
module Admin
  class DashboardController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def index
      render inertia: "admin/Dashboard", props: {
        stats: {
          user_count: User.count,
          article_count: defined?(Article) ? Article.count : 0,
          comment_count: defined?(Comment) ? Comment.count : 0,
          today_count: today_count,
        },
        chart_data: articles_trend_data,
        recent_activities: recent_activities,
        framework: {
          name: "Zen Platform",
          version: File.read(Rails.root.join("VERSION")).strip,
          rails_version: Rails::VERSION::STRING,
          ruby_version: RUBY_VERSION
        }
      }
    end

    private

    def today_count
      User.where("created_at > ?", Date.today).count +
        (defined?(Article) ? Article.where("created_at > ?", Date.today).count : 0)
    end

    def articles_trend_data
      return [] unless defined?(Article)

      30.days.ago.to_date.upto(Date.today).map do |date|
        {
          date: date.iso8601,
          count: Article.where("DATE(created_at) = ?", date).count
        }
      end
    end

    def recent_activities
      PaperTrail::Version.order(created_at: :desc).limit(5).map do |version|
        {
          id: version.id,
          event: version.event,
          item_type: version.item_type,
          item_id: version.item_id,
          whodunnit: version.whodunnit,
          created_at: version.created_at.iso8601,
        }
      end
    rescue => e
      Rails.logger.debug { "[Dashboard] recent_activities error: #{e.message}" }
      []
    end
  end
end
```

### 前端实现

#### 2.2 安装图表库

```bash
npm install @ant-design/charts @ant-design/plots
```

#### 2.3 重写 Dashboard 页面

**文件**：`app/frontend/pages/admin/Dashboard.tsx`

```tsx
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components'
import { Row, Col, Space, Tag, Typography, Table, Badge } from 'antd'
import { Line } from '@ant-design/charts'
import {
  UserOutlined,
  FileTextOutlined,
  CommentOutlined,
  RiseOutlined,
  CodeOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  ThunderboltOutlined,
  ApiOutlined,
} from '@ant-design/icons'
import AdminLayout from '@/layouts/AdminLayout'
import type { ReactNode } from 'react'

const { Link, Text } = Typography

Dashboard.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>

interface DashboardProps {
  stats: {
    user_count: number
    article_count: number
    comment_count: number
    today_count: number
  }
  chart_data: Array<{ date: string; count: number }>
  recent_activities: Array<{
    id: number
    event: string
    item_type: string
    item_id: number
    whodunnit: string | null
    created_at: string
  }>
  framework: {
    name: string
    version: string
    rails_version: string
    ruby_version: string
  }
}

const eventColors: Record<string, string> = {
  create: 'green',
  update: 'blue',
  destroy: 'red',
}

const eventLabels: Record<string, string> = {
  create: '创建',
  update: '更新',
  destroy: '删除',
}

export default function Dashboard({ stats, chart_data, recent_activities, framework }: DashboardProps) {
  const chartConfig = {
    data: chart_data,
    xField: 'date',
    yField: 'count',
    height: 250,
    smooth: true,
    point: { size: 3, shape: 'circle' },
    color: '#D4A537',
    areaStyle: { fill: 'rgba(212, 165, 55, 0.15)' },
    axis: {
      x: { labelAutoRotate: false, labelFormatter: (v: string) => v.slice(5) },
      y: { min: 0 },
    },
  }

  return (
    <PageContainer title="仪表盘" subTitle={`${framework.name} v${framework.version}`}>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            className="glass-card"
            statistic={{
              title: '用户总数',
              value: stats.user_count,
              prefix: <UserOutlined style={{ color: 'var(--ant-color-primary)' }} />,
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            className="glass-card"
            statistic={{
              title: '文章总数',
              value: stats.article_count,
              prefix: <FileTextOutlined style={{ color: '#52c41a' }} />,
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            className="glass-card"
            statistic={{
              title: '评论总数',
              value: stats.comment_count,
              prefix: <CommentOutlined style={{ color: '#faad14' }} />,
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            className="glass-card"
            statistic={{
              title: '今日新增',
              value: stats.today_count,
              prefix: <RiseOutlined style={{ color: '#eb2f96' }} />,
            }}
          />
        </Col>
      </Row>

      {/* 图表 + 最近活动 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <ProCard title="文章发布趋势（近 30 天）" variant="borderless" className="glass-card">
            {chart_data.length > 0 ? (
              <Line {...chartConfig} />
            ) : (
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text type="secondary">暂无数据</Text>
              </div>
            )}
          </ProCard>
        </Col>
        <Col xs={24} lg={10}>
          <ProCard title="最近活动" variant="borderless" className="glass-card">
            <Table
              size="small"
              dataSource={recent_activities}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: '事件',
                  dataIndex: 'event',
                  width: 80,
                  render: (event: string) => (
                    <Badge color={eventColors[event] || 'default'} text={eventLabels[event] || event} />
                  ),
                },
                {
                  title: '对象',
                  dataIndex: 'item_type',
                  width: 100,
                  render: (type: string, record: any) => `${type} #${record.item_id}`,
                },
                {
                  title: '时间',
                  dataIndex: 'created_at',
                  render: (time: string) => new Date(time).toLocaleString('zh-CN'),
                },
              ]}
            />
          </ProCard>
        </Col>
      </Row>

      {/* 快速开始 + 文档（移到底部） */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <ProCard title="快速开始" variant="borderless" className="glass-card">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <Tag color="blue">1</Tag>
                <Text>定义模型 DSL — 在模型中声明字段和展示配置</Text>
              </div>
              <div>
                <Tag color="blue">2</Tag>
                <Text>生成 CRUD — </Text>
                <Link href="https://neekin.github.io/zen_platform/scaffolding/admin" target="_blank">
                  rails generate zen:admin Post
                </Link>
              </div>
              <div>
                <Tag color="blue">3</Tag>
                <Text>生成 API — </Text>
                <Link href="https://neekin.github.io/zen_platform/scaffolding/api" target="_blank">
                  rails generate zen:api Post
                </Link>
              </div>
            </Space>
          </ProCard>
        </Col>
        <Col xs={24} lg={12}>
          <ProCard title="文档" variant="borderless" className="glass-card">
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Link href="https://zen.justfunit.net" target="_blank">使用文档</Link>
              <Link href="/api-docs">API 文档（Swagger）</Link>
              <Link href="https://github.com/neekin/zen_platform" target="_blank">GitHub 仓库</Link>
            </Space>
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  )
}
```

### 验收标准
- [ ] Dashboard 显示 4 个统计卡片（用户数、文章数、评论数、今日新增）
- [ ] 折线图显示近 30 天文章发布趋势（金色线条）
- [ ] 最近活动表格显示最新 5 条审计日志
- [ ] 快速开始和文档链接在底部
- [ ] `npx tsc --noEmit` 0 errors
- [ ] 页面加载 < 1.5s

---

## Task 3：批量操作框架

### 目标
DslTable 选中多行后，显示批量操作按钮栏（不只是删除）。支持开发者自定义批量操作。

### 后端实现

#### 3.1 DSL 扩展：batch_action

**文件**：`lib/zen/model_dsl.rb`

在 `class_methods do` 块内添加：
```ruby
# 定义批量操作
#
# batch_action :publish, label: "批量发布", confirm: "确定发布选中的记录？" do |ids|
#   where(id: ids).update_all(status: "published")
# end
def batch_action(name, label: nil, confirm: nil, &block)
  self.zen_batch_actions = (zen_batch_actions || []) + [{
    name: name.to_s,
    label: label || name.to_s.humanize,
    confirm: confirm,
  }]

  # 注册实例方法
  define_method("batch_#{name}") do |ids|
    instance_exec(ids, &block)
  end
  private "batch_#{name}"
end
```

在 `included do` 块内添加：
```ruby
class_attribute :zen_batch_actions, default: []
```

#### 3.2 批量操作控制器端点

**文件**：修改脚手架模板 `lib/generators/zen/admin/templates/page/controller.rb.tt` 和 `modal/controller.rb.tt`

在 `resources` 路由的 collection 块内添加（或在控制器中添加 action）：
```ruby
# POST /admin/<plural_name>/batch_action
def batch_action
  action_name_param = params[:action_name]
  ids = params[:ids] || []

  # 检查 action 是否已注册
  unless <%= class_name %>.zen_batch_actions.any? { |a| a[:name] == action_name_param }
    render json: { code: 1, message: "未知的批量操作" }, status: :bad_request
    return
  end

  # 调用注册的 batch_action 方法
  method_name = "batch_#{action_name_param}"
  if respond_to?(method_name, true)
    send(method_name, ids)
    render json: { code: 0, message: "批量操作完成" }
  else
    render json: { code: 1, message: "操作未实现" }, status: :bad_request
  end
end
```

**路由**（在 resources 的 collection 块内）：
```ruby
collection do
  post :batch_action
end
```

#### 3.3 在 Article 模型中添加示例

**文件**：`app/models/article.rb`

```ruby
batch_action :publish, label: "批量发布", confirm: "确定发布选中的文章？" do |ids|
  Article.where(id: ids).update_all(status: "published", published_at: Time.current)
end

batch_action :archive, label: "归档", confirm: "确定归档选中的文章？" do |ids|
  Article.where(id: ids).update_all(status: "archived")
end
```

### 前端实现

#### 3.4 修改 DslTable

**文件**：`app/frontend/modules/dsl/DslTable.tsx`

1. Props 新增 `batchActions`：
```tsx
export interface BatchAction {
  name: string
  label: string
  confirm?: string
}

export interface DslTableProps {
  // ... 现有 props
  batchActions?: BatchAction[]
  onBatchAction?: (actionName: string, ids: React.Key[]) => void
}
```

2. 在选中行时显示批量操作按钮栏：
```tsx
{rowSelection && rowSelection.selectedRowKeys.length > 0 && (
  <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
    <Text type="secondary">
      已选择 {rowSelection.selectedRowKeys.length} 项
    </Text>
    {batchActions?.map(action => (
      <Popconfirm
        key={action.name}
        title={action.confirm || `确定执行"${action.label}"？`}
        onConfirm={() => onBatchAction?.(action.name, rowSelection.selectedRowKeys)}
      >
        <Button size="small">{action.label}</Button>
      </Popconfirm>
    ))}
    {onBulkDelete && (
      <Popconfirm
        title="确定删除选中的记录？"
        onConfirm={() => onBulkDelete(rowSelection.selectedRowKeys)}
      >
        <Button size="small" danger>批量删除</Button>
      </Popconfirm>
    )}
    <Button size="small" type="link" onClick={() => rowSelection.onChange([])}>
      取消选择
    </Button>
  </div>
)}
```

#### 3.5 修改 Index 页面示例

**文件**：`app/frontend/pages/admin/articles/Index.tsx`

```tsx
const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

const handleBatchAction = async (actionName: string, ids: React.Key[]) => {
  try {
    await router.post('/admin/articles/batch_action', {
      action_name: actionName,
      ids: ids,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        message.success('批量操作完成')
        setSelectedRowKeys([])
        router.reload()
      },
    })
  } catch {
    message.error('操作失败')
  }
}

// DslTable 中传入：
<DslTable
  meta={meta}
  data={articles}
  basePath="/admin/articles"
  rowSelection={{
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  }}
  batchActions={meta.batch_actions}
  onBatchAction={handleBatchAction}
  onBulkDelete={(ids) => {
    // 现有的删除逻辑
  }}
/>
```

#### 3.6 zen_meta 输出 batch_actions

**文件**：`lib/zen/model_dsl.rb`

在 `zen_meta` 方法的返回值中添加：
```ruby
batch_actions: zen_batch_actions.map { |a| { name: a[:name], label: a[:label], confirm: a[:confirm] } }
```

**文件**：`app/frontend/types/dsl.ts`

```tsx
export interface DslMeta {
  // ... 现有字段
  batch_actions?: Array<{
    name: string
    label: string
    confirm?: string
  }>
}
```

### 验收标准
- [ ] Article 列表页选中多行后，显示"批量发布"和"归档"按钮
- [ ] 点击"批量发布"弹出确认框，确认后执行并刷新列表
- [ ] 批量操作通过 `batch_action` DSL 定义，开发者可自定义
- [ ] `bundle exec rspec` 全通过
- [ ] `npx tsc --noEmit` 0 errors

---

## Task 4：主题定制系统

### 目标
开发者通过 `config/initializers/zen.rb` 配置品牌色、logo、应用名称，后台自动应用。

### 后端实现

#### 4.1 创建配置模块

**文件**：`lib/zen/configuration.rb`

```ruby
module Zen
  class Configuration
    attr_accessor :app_name, :logo, :primary_color, :sidebar_mode

    def initialize
      @app_name = "Zen Platform"
      @logo = "/logo-mark.svg"
      @primary_color = "#1677FF"
      @sidebar_mode = :mix  # :side / :top / :mix
    end
  end

  class << self
    attr_accessor :configuration

    def configuration
      @configuration ||= Configuration.new
    end

    def configure
      yield(configuration)
    end
  end
end
```

#### 4.2 创建初始化文件

**文件**：`config/initializers/zen.rb`

```ruby
Zen.configure do |config|
  config.app_name = "Zen Platform"
  config.logo = "/logo-mark.svg"
  config.primary_color = "#D4A537"  # 金色品牌色
  config.sidebar_mode = :mix
end
```

#### 4.3 通过 Inertia 共享配置

**文件**：`app/controllers/inertia_controller.rb`

在 Inertia 共享数据中添加：
```ruby
inertia_share do
  {
    zen_config: {
      app_name: Zen.configuration.app_name,
      logo: Zen.configuration.logo,
      primary_color: Zen.configuration.primary_color,
      sidebar_mode: Zen.configuration.sidebar_mode,
    }
  }
end
```

如果没有 `inertia_share`，则在 `AdminLayout` 的 props 中手动添加。

### 前端实现

#### 4.4 创建主题配置 Hook

**文件**：`app/frontend/hooks/useZenConfig.ts`

```tsx
import { usePage } from '@inertiajs/react'

interface ZenConfig {
  app_name: string
  logo: string
  primary_color: string
  sidebar_mode: 'side' | 'top' | 'mix'
}

export function useZenConfig(): ZenConfig {
  const { props } = usePage()
  return (props.zen_config as ZenConfig) || {
    app_name: 'Zen Platform',
    logo: '/logo-mark.svg',
    primary_color: '#1677FF',
    sidebar_mode: 'mix',
  }
}
```

#### 4.5 修改 AdminLayout 应用配置

**文件**：`app/frontend/layouts/AdminLayout.tsx`

```tsx
import { useZenConfig } from '@/hooks/useZenConfig'

// 在组件内：
const zenConfig = useZenConfig()

// 修改 darkTheme 和 lightTheme 的 colorPrimary：
const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: zenConfig.primary_color,
    // ... 其他不变
  },
}

const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: zenConfig.primary_color,
    // ... 其他不变
  },
}

// ProLayout 中：
<ProLayout
  title={zenConfig.app_name}
  logo={zenConfig.logo}
  layout={zenConfig.sidebar_mode}
  // ...
/>
```

### 验收标准
- [ ] 修改 `config/initializers/zen.rb` 中的 `primary_color`，后台主色变化
- [ ] 修改 `app_name`，ProLayout 标题和浏览器标签页更新
- [ ] 修改 `logo`，侧边栏 logo 更新
- [ ] 修改 `sidebar_mode`，布局模式切换（side/top/mix）
- [ ] `bundle exec rspec` 全通过
- [ ] `npx tsc --noEmit` 0 errors

---

## 最终验证

所有 4 个 Task 完成后，运行：

```bash
# 后端测试
bundle exec rspec

# 前端类型检查
npx tsc --noEmit

# 前端测试
npx vitest run

# 启动服务器验证
bin/dev
```

访问 `http://localhost:3100/admin/dashboard`：
1. Dashboard 有统计卡片和图表 ✅
2. 按 Cmd+K 弹出命令面板 ✅
3. 文章列表选中多行有批量操作 ✅
4. 主题色是金色（#D4A537）✅
