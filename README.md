<p align="center">
  <img src="public/logo-mark.svg" width="120" alt="Zen Platform" />
  <h1 align="center">Zen Platform</h1>
</p>

[English](./README_EN.md) | 简体中文

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

访问 `http://localhost:3100/admin`，登录 `admin@example.com` / `password123`

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

完整文档：https://zen.justfunit.net

## 🆚 对比

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

## 🤝 贡献

见 [CONTRIBUTING](./CONTRIBUTING.md)

## 📄 许可证

[MIT License](LICENSE)
