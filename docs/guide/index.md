---
title: 指南 - Zen Platform
---

# 指南

## 什么是 Zen Platform？

Zen Platform 是一个声明式全栈应用生成平台，让你用最少的代码快速构建管理后台和 API。

核心理念：**声明即所得** — 在 Model 中声明一次，前端自动渲染。

## 核心概念

### Model DSL

用 DSL 在 Model 中声明字段、关联、展示方式：

```ruby
class Article < ApplicationRecord
  include Zen::ModelDsl

  field :title, :string, required: true
  field :body, :rich_text
  belongs_to :category

  display do
    list { column :title, link: true }
    form { field :title; field :body, as: :rich_text }
  end
end
```

前端页面自动生成，无需手写 ProTable / ProForm 代码。

### 脚手架生成器

一行命令生成完整的 Admin CRUD：

```bash
rails generate zen:admin Article title:string body:rich_text --modal
```

生成：Controller + Inertia 页面 + 路由 + DSL 配置。

### 产品形态

一行 DSL 切换展示形态：

```ruby
product :kanban, group_by: :status
product :calendar, date_field: :published_at
product :gallery
```

## 下一步

- [快速上手](./quick-start) — 15 分钟跑起来
- [Model DSL 详解](/dsl/) — 了解 DSL 全部能力
- [脚手架生成器](/scaffolding/) — 自动化 CRUD 生成
