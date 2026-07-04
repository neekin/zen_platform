<p align="center">
  <h1 align="center">⚡ Zen Platform</h1>
  <p align="center">声明式全栈应用生成平台 — 一行 DSL，自动生成管理后台 + API</p>
</p>

<p align="center">
  <a href="https://github.com/yourusername/zen_platform/actions"><img src="https://github.com/yourusername/zen_platform/workflows/CI/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/yourusername/zen_platform" alt="License"></a>
  <img src="https://img.shields.io/badge/ruby-3.4-red" alt="Ruby">
  <img src="https://img.shields.io/badge/rails-8.1-red" alt="Rails">
  <img src="https://img.shields.io/badge/react-19-blue" alt="React">
</p>

---

## 为什么选择 Zen？

| 特性 | 说明 |
|------|------|
| 📝 **声明即所得** | 在 Model 中用 DSL 声明字段、关联、展示方式，自动生成管理页面和 API |
| ✏️ **富文本开箱即用** | 20 个 Lexical 插件：Mermaid 图表、KaTeX 公式、代码块、视频嵌入 |
| 🎨 **多产品形态** | CRUD 表格、看板拖拽、日历视图、画廊网格 — 一行 DSL 切换 |
| 🔐 **企业级权限** | Pundit + Rolify RBAC，4 级角色，资源级授权 |
| 📊 **审计日志** | PaperTrail 追踪所有变更，带 request context |
| 🚀 **一键生成** | `rails generate zen:admin` 自动生成 Controller + 页面 + 路由 |

## 30 秒上手

```bash
# 1. 克隆
git clone https://github.com/yourusername/zen_platform.git
cd zen_platform

# 2. 安装依赖 + 初始化数据库
bin/setup

# 3. 启动开发服务器
bin/dev
```

打开 `http://localhost:3100/admin`，登录 `admin@example.com` / `password123`

## DSL 示例

```ruby
class Article < ApplicationRecord
  include Zen::ModelDsl

  field :title, :string, required: true
  field :body, :rich_text
  field :status, :enum, values: %w[draft published archived], default: "draft"

  belongs_to :category

  display do
    list do
      column :title, link: true
      column :status, badge: true
    end
    form do
      section "内容" do
        field :title, required: true
        field :body, as: :rich_text
      end
    end
  end
end
```

## 技术栈

| 层 | 技术 |
|----|------|
| Frontend | React 19 · TypeScript · Ant Design 6 · Pro Components · Inertia.js 3 · Vite 8 |
| Backend | Rails 8.1 · Ruby 3.4 · SQLite3 · Solid Queue/Cache/Cable |
| Rich Text | Lexical 0.46 · 20 Plugins · Mermaid · KaTeX |

## 对比

| 维度 | Zen Platform | ActiveAdmin | Avo | Administrate |
|------|-------------|-------------|-----|--------------|
| 前端框架 | React + Ant Design | Arbre (ERB) | ViewComponent | ERB |
| DSL 驱动 | ✅ | ✅ | ✅ | ❌ |
| 富文本 | ✅ 20 插件 | ❌ | ❌ | ❌ |
| 多形态 | ✅ CRUD/看板/日历/画廊 | ❌ | ❌ | ❌ |
| API 生成 | ✅ Swagger | ❌ | ❌ | ❌ |
| 实时通知 | ✅ ActionCable | ❌ | ❌ | ❌ |

## 文档

- [快速上手](docs/guide/quick-start.md)
- [Model DSL](docs/dsl/index.md)
- [脚手架生成器](docs/scaffolding/index.md)
- [API 文档](docs/api/index.md)

## 许可证

[MIT License](LICENSE)
