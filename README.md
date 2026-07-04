<p align="center">
  <h1 align="center">⚡ Zen Platform</h1>
  <p align="center">声明式全栈应用生成平台 — 一行 DSL，自动生成管理后台 + API</p>
</p>

<p align="center">
  <a href="https://github.com/neekin/zen_platform/actions"><img src="https://github.com/neekin/zen_platform/workflows/CI/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/neekin/zen_platform" alt="License"></a>
  <img src="https://img.shields.io/badge/ruby-4.0-red" alt="Ruby">
  <img src="https://img.shields.io/badge/rails-8.1-red" alt="Rails">
  <img src="https://img.shields.io/badge/react-19-blue" alt="React">
</p>

---

## 为什么选择 Zen？

<table>
<tr>
<td width="33%"><h3>📝 声明即所得</h3>在 Model 中用 DSL 声明字段、关联、展示方式，自动生成完整的管理页面和 API</td>
<td width="33%"><h3>✏️ 富文本开箱即用</h3>20 个 Lexical 插件：Mermaid 图表、KaTeX 公式、代码块、视频嵌入、@提及</td>
<td width="33%"><h3>🎨 多产品形态</h3>CRUD 表格、看板拖拽、日历视图画廊网格 — 一行 DSL 切换</td>
</tr>
</table>

## 30 秒上手

```bash
# 1. 克隆
git clone https://github.com/neekin/zen_platform.git
cd zen_platform

# 2. 安装依赖 + 初始化数据库（完成后自动启动服务器）
bin/setup
```

打开 `http://localhost:3000/admin`，登录 `admin@example.com` / `password123`

## DSL 示例

```ruby
class Article < ApplicationRecord
  include Zen::ModelDsl

  field :title, :string, required: true
  field :body, :rich_text
  field :status, :enum, values: %w[draft published archived], default: "draft"
  field :is_featured, :boolean, default: false

  belongs_to :category

  display do
    list do
      column :title, link: true
      column :status, badge: true
      column :created_at, format: :relative_time
    end
    form do
      section "基本信息" do
        field :title, required: true
        field :status, as: :radio
      end
      section "内容" do
        field :body, as: :rich_text
      end
    end
  end
end
```

一条命令生成完整 CRUD：

```bash
rails generate zen:admin Article title:string body:text status:enum --enums='{"status":["draft","published","archived"]}' --modal
```

## 核心特性

| 特性 | 说明 |
|------|------|
| **Model DSL** | 声明字段、关联、展示配置，自动生成 JSON Schema |
| **DslTable / DslForm** | 运行时从 DSL 元数据动态渲染列表和表单 |
| **富文本编辑器** | Lexical 引擎，20 个插件，支持 Mermaid/KaTeX/代码块 |
| **RBAC 权限** | Pundit + Rolify，4 级角色，资源级授权 |
| **审计日志** | PaperTrail 追踪所有变更，带 request context |
| **实时通知** | ActionCable WebSocket 推送 |
| **数据导出** | CSV/Excel/PDF 异步导出 |
| **API 网关** | rack-attack 分层限流 + 4 种认证方式 |
| **脚手架生成器** | `zen:admin` / `zen:api` 一键生成 CRUD + Swagger 文档 |

## 技术栈

```
┌─────────────────────────────────────────────┐
│  Frontend                                    │
│  React 19 · TypeScript · Ant Design 6       │
│  Pro Components · Inertia.js 3 · Vite 8     │
├─────────────────────────────────────────────┤
│  Backend                                     │
│  Rails 8.1 · Ruby 4.0 · SQLite3             │
│  Solid Queue · Solid Cache · Solid Cable     │
├─────────────────────────────────────────────┤
│  Rich Text                                   │
│  Lexical 0.46 · 20 Plugins                  │
│  Mermaid · KaTeX · Code Highlight            │
└─────────────────────────────────────────────┘
```

## 对比

| 维度 | Zen Platform | ActiveAdmin | Avo | Administrate |
|------|-------------|-------------|-----|--------------|
| 前端框架 | React + Ant Design | Arbre (ERB) | ViewComponent | ERB |
| DSL 驱动 | ✅ Model DSL | ✅ DSL | ✅ Resource DSL | ❌ 手写 |
| 富文本 | ✅ 20 插件 | ❌ | ❌ | ❌ |
| 多形态 | ✅ CRUD/看板/日历/画廊 | ❌ | ❌ | ❌ |
| API 生成 | ✅ Swagger | ❌ | ❌ | ❌ |
| 权限 | ✅ Pundit + Rolify | ✅ CanCanCan | ✅ Pundit | ❌ |
| 实时通知 | ✅ ActionCable | ❌ | ❌ | ❌ |
| 前端测试 | ✅ Vitest | ❌ | ❌ | ❌ |

## 文档

- [快速上手](docs/guide/quick-start.md)
- [Model DSL](docs/dsl/index.md)
- [脚手架生成器](docs/scaffolding/index.md)
- [富文本编辑器](docs/rich-text/index.md)
- [API 文档](docs/api/index.md)
- [部署指南](docs/deployment/index.md)

## 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解开发流程。

## 许可证

[MIT License](LICENSE)
