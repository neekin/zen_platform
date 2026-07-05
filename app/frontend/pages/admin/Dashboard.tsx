import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components'
import { Row, Col, Space, Tag, Typography, Table, Badge, Alert } from 'antd'
import {
  UserOutlined,
  FileTextOutlined,
  CommentOutlined,
  RiseOutlined,
  DatabaseOutlined,
  BookOutlined,
} from '@ant-design/icons'
import AdminLayout from '@/layouts/AdminLayout'
import RealtimeTrendChart from '@/components/admin/RealtimeTrendChart'
import type { ReactNode } from 'react'

const { Link, Text, Paragraph } = Typography

Dashboard.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>

interface StatItem {
  label: string
  value: number
  icon: string
}

interface ChartDataPoint {
  time: string
  value: number
}

interface DashboardProps {
  stats: StatItem[]
  chart_data: ChartDataPoint[]
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

const iconMap: Record<string, ReactNode> = {
  user: <UserOutlined />,
  article: <FileTextOutlined />,
  comment: <CommentOutlined />,
  rise: <RiseOutlined />,
  database: <DatabaseOutlined />,
}

const iconColors: Record<string, string> = {
  user: 'var(--ant-color-primary)',
  article: '#52c41a',
  comment: '#faad14',
  rise: '#eb2f96',
  database: '#13c2c2',
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
  return (
    <PageContainer title="仪表盘" subTitle={`${framework.name} v${framework.version}`}>
      {/* 统计卡片 */}
      {stats.length > 0 && (
        <Row gutter={[16, 16]}>
          {stats.map((stat, index) => (
            <Col key={index} xs={24} sm={12} lg={Math.max(6, 24 / stats.length)}>
              <StatisticCard
                className="glass-card"
                statistic={{
                  title: stat.label,
                  value: stat.value,
                  prefix: (
                    <span style={{ color: iconColors[stat.icon] || 'var(--ant-color-primary)' }}>
                      {iconMap[stat.icon] || <DatabaseOutlined />}
                    </span>
                  ),
                }}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* 实时趋势图 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <RealtimeTrendChart
            initialData={chart_data}
            title="实时数据趋势"
            yFieldLabel="请求数"
            color="#D4A537"
          />
        </Col>
      </Row>

      {/* 最近活动 */}
      {recent_activities.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={24}>
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
      )}

      {/* 快速开始 + 自定义指南 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <ProCard title="快速开始" variant="borderless" className="glass-card">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <Tag color="blue">1</Tag>
                <Text>定义模型 DSL — 在模型中声明字段和展示配置</Text>
              </div>
              <div>
                <Tag color="blue">2</Tag>
                <Text>生成 CRUD — </Text>
                <Link href="https://zen.justfunit.net/scaffolding/admin" target="_blank">
                  rails generate zen:admin Post
                </Link>
              </div>
              <div>
                <Tag color="blue">3</Tag>
                <Text>生成 API — </Text>
                <Link href="https://zen.justfunit.net/scaffolding/api" target="_blank">
                  rails generate zen:api Post
                </Link>
              </div>
            </Space>
          </ProCard>
        </Col>
        <Col xs={24} lg={12}>
          <ProCard title="文档" variant="borderless" className="glass-card">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <Link href="https://zen.justfunit.net" target="_blank">
                <BookOutlined /> 使用文档
              </Link>
              <Link href="/api-docs">API 文档（Swagger）</Link>
              <Link href="https://github.com/neekin/zen_platform" target="_blank">GitHub 仓库</Link>
            </Space>
          </ProCard>
        </Col>
      </Row>

      {/* 自定义统计指南 */}
      <ProCard title="如何添加统计卡片" variant="borderless" className="glass-card" style={{ marginTop: 16 }}>
        <Alert
          type="info"
          showIcon
          title="自定义 Dashboard 统计"
          description="编辑 DashboardController 的 build_stats 方法即可添加统计卡片"
          style={{ marginBottom: 16 }}
        />
        <Paragraph>
          <Text code>app/controllers/admin/dashboard_controller.rb</Text>
        </Paragraph>
        <Paragraph>
          <pre style={{ background: 'rgba(0,0,0,0.06)', padding: 12, borderRadius: 6, fontSize: 13 }}>
{`def build_stats
  [
    { label: "用户总数", value: User.count, icon: "user" },
    { label: "文章总数", value: Article.count, icon: "article" },
    { label: "今日新增", value: User.where("created_at > ?", Date.today).count, icon: "rise" },
  ]
end`}
          </pre>
        </Paragraph>
        <Text type="secondary">
          可用 icon: user, article, comment, rise, database
        </Text>
      </ProCard>
    </PageContainer>
  )
}
