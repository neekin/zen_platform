# 关联定义

## 语法

```ruby
belongs_to :name, **options
has_many :name, **options
has_many_through :name, :through, **options
```

## belongs_to

```ruby
class Article < ApplicationRecord
  include Zen::ModelDsl
  belongs_to :category, display: :name, searchable: true
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

## has_many

```ruby
class User < ApplicationRecord
  include Zen::ModelDsl
  has_many :articles, dependent: :destroy
end
```

## has_many_through

```ruby
class Article < ApplicationRecord
  include Zen::ModelDsl
  has_many_through :tags, :article_tags
end
```
