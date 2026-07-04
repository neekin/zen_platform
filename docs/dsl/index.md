# Model DSL 概述

Zen Platform 的核心是 **Model DSL** — 在 Ruby Model 中声明式定义字段、关联和展示配置。

## 基本用法

```ruby
class Article < ApplicationRecord
  include Zen::ModelDsl

  # 字段定义
  field :title, :string, required: true
  field :body, :rich_text
  field :status, :enum, values: %w[draft published archived], default: "draft"

  # 关联定义
  belongs_to :category

  # 展示配置
  display do
    list do
      column :title, link: true
      column :status, badge: true
    end
    form do
      section "基本信息" do
        field :title, required: true
        field :status, as: :radio
      end
    end
  end
end
```

## DSL 做了什么？

1. **字段定义** → 生成 JSON Schema（`zen_meta`）
2. **关联定义** → 自动推断外键和 Select 数据源
3. **展示配置** → 驱动 DslTable/DslForm 自动渲染
4. **enum 字段** → 自动调用 ActiveRecord `enum`

## 元数据获取

```ruby
# 获取完整元数据 JSON
Article.zen_meta

# API 端点
GET /api/v1/meta/Article
```
