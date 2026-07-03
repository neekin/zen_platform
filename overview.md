# Zen Platform 开发路线图

> 当前版本：v0.2.0 | 目标：v1.0.0 开源发布
> 定位：声明式全栈应用生成平台，对标 django-admin / 若依

---

## 现状总结

### 已完成（10 个模块）

| 模块 | 完成度 | 说明 |
|------|--------|------|
| API 认证 | 100% | JWT / API Key / Bearer Token / HMAC 签名，4 种方式 |
| 富文本编辑器 | 100% | 20 个 Lexical 插件，含 Mermaid/KaTeX/代码块/提及/emoji |
| Admin 组件库 | 100% | ImageUpload / FileUpload / TagInput / StatusBadge / KanbanBoard |
| 脚手架生成器 | 80% | Admin (CRUD/modal/page/kanban) + API 生成器 |
| 权限系统 | 100% | Pundit + Rolify，6 个 Policy 文件 |
| 审计日志 | 90% | PaperTrail 变更追踪 + AuditLogs 前端展示 |
| 导出系统 | 100% | CSV / Excel / PDF 异步导出，白名单防护 |
| 通知系统 | 100% | NotificationChannel (ActionCable) + NotificationService |
| 主题切换 | 100% | light / dark / system 三态切换 + localStorage 持久化 |
| CI/CD | 90% | GitHub Actions（backend + frontend + swagger），缺 Dependabot 配置完善 |

### 部分完成（7 个模块）

| 模块 | 完成度 | 缺口 |
|------|--------|------|
| Model DSL | 70% | enum 未自动集成 ActiveRecord enum；form/list 配置无运行时渲染器 |
| 看板视图 | 80% | 跨列拖拽可用，列内排序硬编码 index=0 |
| 脚手架模板 | 75% | 有 CRUD/modal/kanban，缺 calendar/gallery |
| 测试覆盖 | 50% | 74 个 RSpec，但 DSL 核心/Service/Policy 边界场景不足 |
| 安全配置 | 80% | CORS/SSL/rack-attack 有，CSP 全注释、生产 Hosts 未配置 |
| README | 60% | 内容完整但非开源 landing page 风格 |
| Dashboard | 40% | UI 框架有，统计数据全硬编码 mock |

### 未开始（10 个功能）

| 功能 | 优先级 | 说明 |
|------|--------|------|
| DSL → 前端桥接 | P0 | API 元数据端点，暴露 DSL 配置给前端 |
| 运行时表单生成 | P0 | DSL form 配置 → 动态 React 表单渲染 |
| 运行时列表生成 | P0 | DSL list 配置 → 动态 ProTable 列渲染 |
| 日历视图 | P1 | 脚手架模板 + 前端组件 |
| 画廊视图 | P2 | 脚手架模板 + 前端组件 |
| 批量操作 | P1 | bulk delete / update |
| 软删除 | P2 | paranoid 模式 |
| i18n 国际化 | P2 | Rails i18n + react-i18next |
| AI 助手 | P3 | 后端 AI 端点 + 编辑器插件 |
| 文档站点 | P2 | VitePress |

---

## 四阶段开发计划

### Phase 1 — 代码质量加固（v0.3.0）

**目标**：清除代码审查遗留的所有 P1/P2 问题，达到开源质量门槛。

| # | 任务 | 文件 | 复杂度 |
|---|------|------|--------|
| 1 | BearerToken 去重 — 委托给 JwtAuthenticatable#decode_jwt | `concerns/api/bearer_token_authenticatable.rb` | 低 |
| 2 | PaperTrail 兼容性 — 降级到 15.x 或锁定等待 16.1 更新 | `Gemfile` | 低 |
| 3 | KanbanBoard 列内排序 — 修复 newIndex 硬编码 + 同列 return | `modules/admin/components/products/KanbanBoard.tsx` | 中 |
| 4 | ApiKey 过期一致性 — 统一 active scope 和 expired? 的比较符 | `models/api_key.rb` | 低 |
| 5 | SignatureAuthenticatable body rewind | `concerns/api/signature_authenticatable.rb` | 低 |
| 6 | AuditLogs 分页 — 替换硬编码 limit(100) 为 Kaminari | `controllers/admin/audit_logs_controller.rb` | 低 |
| 7 | ApplicationPolicy 使用 has_any_role? | `policies/application_policy.rb` | 低 |
| 8 | SessionsController 参数 snake_case | `controllers/admin/sessions_controller.rb` + 前端 Login.tsx | 低 |
| 9 | CSP 启用 — 取消注释并配置合理策略 | `config/initializers/content_security_policy.rb` | 中 |
| 10 | 生产环境 Hosts 配置 | `config/environments/production.rb` | 低 |

### Phase 2 — 核心功能补全（v0.5.0）

**目标**：兑现"声明即所得"的核心承诺，打通 Model DSL → 前端的元数据桥梁。

#### 2.1 DSL enum 自动集成（后端）

```ruby
# 目标：field :status, :enum, values: %w[draft published archived]
# 自动生成 enum :status, { draft: 0, published: 1, archived: 2 }
# 无需手动写 enum 声明

def field(name, type, **options)
  if type == :enum && options[:values].is_a?(Array)
    values_map = options[:values].each_with_index.to_h
    enum name => values_map
  end
  # ... 存储到 zen_fields
end
```

#### 2.2 API 元数据端点

```ruby
# GET /api/v1/meta/:model_name
# 返回模型的完整 DSL 配置（字段、关联、展示、产品形态）
# 前端可据此动态渲染表单和列表

class Api::V1::MetaController < ApiController
  def show
    model = params[:model_name].classify.constantize
    raise "Unauthorized" unless ALLOWED_MODELS.include?(model.name)

    render json: {
      fields: model.zen_fields.transform_values(&:to_h),
      associations: model.zen_associations.transform_values(&:to_h),
      display: model.zen_display_config,
      products: model.zen_product_configs
    }
  end
end
```

#### 2.3 运行时表单生成器（前端）

```tsx
// <DslForm model="Article" record={article} onSubmit={handleSubmit} />
// 自动从 /api/v1/meta/Article 获取配置，按 form.sections 渲染表单
// 支持 as: :rich_text, :image, :select, :radio, :switch 等组件映射
```

#### 2.4 运行时列表生成器（前端）

```tsx
// <DslTable model="Article" />
// 自动从 meta 端点获取 list.columns 配置
// 支持 link: true, badge: true, format: :relative_time 等展示选项
```

#### 2.5 补充产品形态

| 形态 | 模板 | 前端组件 | 说明 |
|------|------|----------|------|
| 日历 | `templates/products/calendar/*.tt` | `CalendarView.tsx` | 按 date 字段分组展示 |
| 画廊 | `templates/products/gallery/*.tt`` | `GalleryView.tsx` | 按 image 字段网格展示 |

#### 2.6 批量操作

- ProTable 添加 rowSelection
- 批量删除 / 批量更新状态
- 控制器添加 `bulk_destroy` / `bulk_update` action

#### 2.7 服务端分页/搜索/过滤标准模式

- 统一 index action 接受 page/per_page/q/filter 参数
- 返回 `{ data: [], total: N, current_page: N }`
- ProTable 对接 server-side pagination

#### 2.8 软删除模式

```ruby
# DSL 声明
field :archived_at, :datetime
product :soft_delete, column: :archived_at

# 自动添加 default_scope where(archived_at: nil)
# 自动添加 restore / archive 方法
```

### Phase 3 — 开源准备（v0.7.0）

**目标**：面向开源社区的产品化包装，让 GitHub 访客 30 秒内理解项目价值。

#### 3.1 README 重写

从"内部项目文档"风格改为"开源 landing page"风格：
- Hero section：一句话定位 + 核心卖点
- Feature showcase：Model DSL 代码片段 + 效果截图
- Quick start：3 步跑起来
- Comparison table：vs ActiveAdmin / Avo / Administrate
- Links：文档站、Demo、Changelog

#### 3.2 文档站点（VitePress）

- 快速上手
- Model DSL 完整 API
- 脚手架生成器所有选项
- 富文本编辑器插件开发指南
- 部署指南

#### 3.3 Demo 站点

- 部署到 Render/Railway/Fly.io
- 预置 Article/Task/Product 示例数据
- 在线体验脚手架生成

#### 3.4 测试覆盖补充

| 模块 | 当前 | 目标 |
|------|------|------|
| Model DSL | 1 个 spec | 字段/关联/展示/产品形态/enum 全覆盖 |
| Policy | 1 个 spec | 所有角色的 index/show/create/update/destroy |
| 认证模块 | 1 个 spec | 过期/无效/篡改/多重策略边界 |
| ExportJob | 1 个 spec | 白名单/异步/错误处理 |
| 前端组件 | 0 | RichTextEditor / KanbanBoard / DslForm |

#### 3.5 安全加固

- CSP 启用并测试富文本编辑器兼容性
- 生产环境 Hosts 配置
- rack-attack 按 endpoint 细化限流规则
- brakeman + bundler-audit 在 CI 中强制为 0 告警

### Phase 4 — 差异化特色功能（v1.0.0）

**目标**：打造 Rails admin 赛道独一无二的核心竞争力。

#### 4.1 AI-Ready 元数据闭环

```
用户输入自然语言 → AI 生成 Model DSL → 脚手架一键生成 → 完整后台
                    ↑                                      ↓
                    └──── DSL 元数据 API 暴露 ←────────────┘
```

- **后端端点**：`POST /api/v1/ai/generate_dsl`，接收自然语言描述，返回 Model DSL 代码
- **前端交互**：管理后台"AI 建模"页面，输入需求 → 预览 DSL → 一键生成
- **元数据 API**：Phase 2 已建好的 meta 端点作为 AI 上下文

#### 4.2 富文本 AI 助手插件

- 续写：光标位置触发 AI 续写
- 摘要：选中文本 → 生成摘要
- 翻译：选中文本 → 翻译
- 润色：选中文本 → 语法纠错/风格优化
- 作为 Lexical 插件，注册到 Content Engine 插件体系

#### 4.3 多产品形态运行时切换

同一模型可以在 CRUD / 看板 / 日历 / 画廊之间运行时切换，不需要重新生成代码：
- 前端视图切换器（类似 Notion 的 view selector）
- URL 参数驱动（`?view=kanban`）
- 用户偏好持久化

#### 4.4 插件市场机制

Content Engine 插件支持动态注册：
- `registerPlugin(name, component, config)` API
- 第三方插件通过 npm 包安装
- 插件配置文件（类似 VSCode 的 `package.json` contributes）

#### 4.5 i18n 国际化

- Rails i18n 后端（zh-CN / en）
- react-i18next 前端
- 脚手架生成的表单标签自动使用 i18n key

#### 4.6 多租户支持（可选）

- `acts_as_tenant` 集成
- DSL 声明 `tenant :organization`
- 自动 scope 所有查询

---

## 优先级矩阵

```
高价值
  │
  │  ┌─────────────────┐  ┌─────────────────┐
  │  │ DSL→前端桥接     │  │ AI-Ready 闭环   │
  │  │ (Phase 2 核心)  │  │ (Phase 4 核心)  │
  │  └─────────────────┘  └─────────────────┘
  │  ┌─────────────────┐  ┌─────────────────┐
  │  │ 代码质量加固     │  │ 文档+Demo 站点  │
  │  │ (Phase 1)       │  │ (Phase 3)       │
  │  └─────────────────┘  └─────────────────┘
  │  ┌─────────────────┐
  │  │ 日历/画廊模板    │
  │  │ 批量操作/软删除  │
  │  └─────────────────┘
  │
  └────────────────────────────────────────────── 低价值
   高难度                                    低难度
```

**建议执行顺序**：Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1 全是低难度高价值（修 bug），Phase 2 是高难度高价值（核心能力），Phase 3 是中难度高价值（开源包装），Phase 4 是高难度高价值（差异化）。
