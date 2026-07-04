# Zen Platform

[English](./README.md) | 简体中文

---

一行 DSL 声明，自动生成完整管理后台 + API。

## ✨ 特性

- **声明即所得** — Model 中声明一次，前端自动渲染
- **多产品形态** — 表格 / 看板 / 日历 / 画廊，一行 DSL 切换
- **富文本开箱即用** — 20 个 Lexical 插件（Mermaid/KaTeX/代码块）
- **企业级权限** — Pundit + Rolify RBAC，4 级角色
- **审计日志** — PaperTrail 全量追踪
- **一键生成** — `rails generate zen:admin` 生成全套 CRUD

## 🚀 快速开始

```bash
git clone https://github.com/neekin/zen_platform.git
cd zen_platform
bin/setup
```

访问 `http://localhost:3000/admin`，登录 `admin@example.com` / `password123`

## 📖 DSL 示例

```ruby
class Article < ApplicationRecord
  include Zen::ModelDsl

  field :title, :string, required: true
  field :body, :rich_text
  field :status, :enum, values: %w[draft published archived]

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

## 📖 文档

完整文档：https://neekin.github.io/zen_platform

## 🆚 对比

| 功能 | Zen Platform | ActiveAdmin | Avo | 若依 |
|------|--------------|-------------|-----|------|
| DSL 声明 | ✅ | ✅ | ✅ | ❌ |
| 前端自动渲染 | ✅ React 19 | ❌ ERB | ❌ ERB | ✅ Vue |
| 多产品形态 | ✅ | ❌ | ❌ | 部分 |
| 富文本 | ✅ 20 插件 | ❌ | ❌ | 基础 |
| API 生成 | ✅ Swagger | ❌ | ❌ | ❌ |

## 🤝 贡献

见 [CONTRIBUTING](./CONTRIBUTING.md)

## 📄 许可证

[MIT License](LICENSE)
