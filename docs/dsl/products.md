---
title: 产品形态
---

# 产品形态

Zen Platform 支持在同一模型上声明多种产品形态，一行 DSL 切换展示方式。

## 支持的形态

| 形态 | DSL | 说明 |
|------|-----|------|
| `:crud` | 默认 | ProTable 表格（默认） |
| `:kanban` | `product :kanban` | 看板拖拽 |
| `:calendar` | `product :calendar` | 日历视图 |
| `:gallery` | `product :gallery` | 画廊网格 |
| `:soft_delete` | `product :soft_delete` | 软删除 |

## kanban（看板）

```ruby
class Task < ApplicationRecord
  include Zen::ModelDsl

  field :title, :string
  field :status, :enum, values: %w[todo in_progress done]

  product :kanban,
    group_by: :status,
    title_field: :title,
    order_field: :position
end
```

- `group_by` — 分组的枚举字段
- `title_field` — 卡片标题字段
- `order_field` — 排序字段（拖拽后自动更新）

看板支持拖拽排序，列内和跨列均可。

生成器：`rails generate zen:admin Task --product=kanban`

## calendar（日历）

```ruby
class Event < ApplicationRecord
  include Zen::ModelDsl

  field :title, :string
  field :starts_at, :datetime

  product :calendar,
    date_field: :starts_at,
    title_field: :title
end
```

- `date_field` — 日期字段
- `title_field` — 事件标题字段

生成器：`rails generate zen:admin Event --product=calendar`

## gallery（画廊）

```ruby
class Photo < ApplicationRecord
  include Zen::ModelDsl

  field :name, :string
  field :cover, :image

  product :gallery,
    cover_field: :cover,
    title_field: :name
end
```

- `cover_field` — 封面图片字段
- `title_field` — 标题字段

生成器：`rails generate zen:admin Photo --product=gallery`

## soft_delete（软删除）

```ruby
class Article < ApplicationRecord
  include Zen::ModelDsl

  field :archived_at, :datetime

  product :soft_delete, column: :archived_at
end
```

自动生成：
- `scope :active` — 只返回未归档记录
- `default_scope` — 默认排除已归档记录
- `archive!` — 归档记录
- `restore!` — 恢复记录
- `archived?` — 检查是否已归档
