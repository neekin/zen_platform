---
title: API 参考
---

# DSL API 参考

## 实例方法

### zen_meta

返回模型的完整元数据 JSON。

```ruby
Article.zen_meta
```

返回结构：

```json
{
  "model_name": "Article",
  "fields": {
    "title": { "type": "string", "required": true },
    "body": { "type": "rich_text" },
    "status": { "type": "enum", "enum_values": ["draft", "published", "archived"] }
  },
  "associations": {
    "category": {
      "type": "belongs_to",
      "foreign_key": "category_id",
      "target_class_name": "Category",
      "display_field": "name",
      "searchable": true
    }
  },
  "display": {
    "list": {
      "columns": [
        { "name": "title", "link": true },
        { "name": "status", "badge": true }
      ]
    },
    "form": {
      "sections": [
        {
          "title": "基本信息",
          "fields": [
            { "name": "title", "required": true },
            { "name": "status", "as": "radio" }
          ]
        }
      ]
    }
  },
  "products": []
}
```

## DSL 方法

### field

```ruby
field :name, :type, **options
```

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `required` | `boolean` | `false` | 是否必填 |
| `default` | `any` | `nil` | 默认值 |
| `placeholder` | `string` | `nil` | 占位符 |
| `values` | `array` | `[]` | 枚举值（仅 `:enum` 类型） |
| `accept` | `array` | `[]` | 文件类型（仅 `:image`/`:file`） |
| `max_size` | `integer` | `nil` | 最大文件大小（字节） |

### belongs_to

```ruby
belongs_to :category, display: :name, searchable: true
```

### display

```ruby
display do
  list { ... }
  form { ... }
  detail { ... }
end
```

### product

```ruby
product :kanban
product :calendar
product :gallery
product :soft_delete, column: :archived_at
```

## 辅助方法

### zen_props

Controller 中注入 DSL 元数据到 Inertia props：

```ruby
def index
  @articles = Article.all
  render inertia: "admin/articles/Index",
    props: zen_props(Article, articles: @articles.as_json)
end
```

### policy_scope

Pundit 权限范围查询：

```ruby
@articles = policy_scope(Article)
```
