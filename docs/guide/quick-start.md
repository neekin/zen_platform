# 快速上手

## 环境要求

- Ruby 4.0+
- Node.js 20+
- SQLite3

## 安装

```bash
# 克隆
git clone https://github.com/neekin/zen_platform.git
cd zen_platform

# 安装依赖 + 初始化数据库（完成后自动启动服务器）
bin/setup
```

打开 `http://localhost:3000/admin`，登录 `admin@example.com` / `password123`

## 创建你的第一个模型

```bash
# 1. 生成模型
rails generate model Post title:string body:text status:string

# 2. 添加 DSL
# app/models/post.rb
class Post < ApplicationRecord
  include Zen::ModelDsl

  field :title, :string, required: true
  field :body, :rich_text
  field :status, :enum, values: %w[draft published], default: "draft"

  display do
    list do
      column :title, link: true
      column :status, badge: true
    end
    form do
      section "内容" do
        field :title, required: true
        field :body, as: :rich_text
        field :status, as: :radio
      end
    end
  end
end

# 3. 生成 Admin CRUD
rails generate zen:admin Post title:string body:text status:enum --enums='{"status":["draft","published"]}' --modal

# 4. 迁移数据库
bin/rails db:migrate
```

访问 `/admin/posts` 即可看到自动生成的管理页面。
