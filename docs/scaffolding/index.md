---
title: 脚手架
---

# 脚手架生成器

Zen Platform 提供两个生成器：

| 生成器 | 命令 | 说明 |
|--------|------|------|
| Admin | `rails generate zen:admin ModelName` | 生成管理后台 CRUD |
| API | `rails generate zen:api ModelName` | 生成 JSON API 端点 |

## 生成内容

以 `zen:admin` 为例，生成以下文件：

```
app/controllers/admin/articles_controller.rb
app/frontend/pages/admin/articles/Index.tsx
config/routes.rb (自动插入路由)
```

路由自动添加到 `config/routes.rb`：

```ruby
namespace :admin do
  resources :articles
end
```

## 与 Model DSL 的关系

生成器读取 `zen_meta` 自动渲染页面，**无需手动编写前端代码**：

```bash
# 1. 定义 Model + DSL
# app/models/article.rb
class Article < ApplicationRecord
  include Zen::ModelDsl
  field :title, :string
  # ...
end

# 2. 运行生成器
rails generate zen:admin Article

# 3. 完成！访问 /admin/articles 即可
```

## 下一步

- [Admin 生成器](/scaffolding/admin) — 管理后台 CRUD
- [API 生成器](/scaffolding/api) — REST API
