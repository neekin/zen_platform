<p align="center">
  <img src="public/logo-mark.svg" width="120" alt="Zen Platform" />
  <h1 align="center">Zen Platform</h1>
</p>

English | [简体中文](./README.md)

---

One DSL declaration, auto-generate complete admin panel + API.

## ✨ Features

- **Declarative** — Declare once in Model, frontend auto-renders
- **Multi-form** — Table / Kanban / Calendar / Gallery, switch with one DSL
- **Rich text out of box** — 20 Lexical plugins (Mermaid/KaTeX/Code blocks)
- **Enterprise RBAC** — Pundit + Rolify, 4-level roles
- **Audit log** — PaperTrail full tracking
- **One-click generate** — `rails generate zen:admin` generates full CRUD

## 🚀 Quick Start

```bash
git clone https://github.com/neekin/zen_platform.git
cd zen_platform
bin/setup
```

Visit `http://localhost:3100/admin`, login with `admin@example.com` / `password123`

## 📖 DSL Example

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
      section "Content" do
        field :title, required: true
        field :body, as: :rich_text
      end
    end
  end
end
```

## 📖 Documentation

Full documentation: https://zen.justfunit.net

## 🆚 Comparison

| Feature | Zen Platform | ActiveAdmin | Avo | Administrate |
|---------|-------------|-------------|-----|--------------|
| Frontend | React + Ant Design | Arbre (ERB) | ViewComponent | ERB |
| DSL | ✅ Model DSL | ✅ DSL | ✅ Resource DSL | ❌ Manual |
| Rich text | ✅ 20 plugins | ❌ | ❌ | ❌ |
| Multi-form | ✅ CRUD/Kanban/Calendar/Gallery | ❌ | ❌ | ❌ |
| API gen | ✅ Swagger | ❌ | ❌ | ❌ |
| Auth | ✅ Pundit + Rolify | ✅ CanCanCan | ✅ Pundit | ❌ |
| WebSocket | ✅ ActionCable | ❌ | ❌ | ❌ |
| Frontend tests | ✅ Vitest | ❌ | ❌ | ❌ |

## 🤝 Contributing

See [CONTRIBUTING](./CONTRIBUTING.md)

## 📄 License

[MIT License](LICENSE)
