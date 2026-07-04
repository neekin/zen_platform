---
title: 关联定义
---

# 关联定义

## 语法

```ruby
belongs_to :model_name
has_many :model_name
```

DSL 会自动读取 Model 中的 `belongs_to` / `has_many` 声明，无需重复定义。

## belongs_to（多对一）

```ruby
class Article < ApplicationRecord
  include Zen::ModelDsl

  belongs_to :category, display: :name, searchable: true

  field :title, :string
end
```

### 选项

| 选项 | 说明 | 默认值 |
|------|------|--------|
| `display` | 关联对象的显示字段 | `:name` |
| `searchable` | 是否支持搜索 | `true` |
| `creatable` | 是否支持快速创建 | `false` |

### 效果

- 表单中渲染为 `ProFormSelect`，选项来自关联表
- 列表中可通过 `display: :name` 显示关联对象的名称
- DSL 自动创建 `field :category_id, :reference`

## has_many（一对多）

```ruby
class User < ApplicationRecord
  include Zen::ModelDsl
  has_many :articles, dependent: :destroy
end
```

## has_many through（多对多）

```ruby
class Article < ApplicationRecord
  include Zen::ModelDsl
  has_many_through :tags, :article_tags
end
```

## zen_meta 中的关联信息

```json
{
  "associations": {
    "category": {
      "name": "category",
      "type": "belongs_to",
      "target_class_name": "Category",
      "foreign_key": "category_id",
      "display_field": "name",
      "searchable": true
    }
  }
}
```

前端 `DslTable` / `DslForm` 自动读取并渲染关联关系。
