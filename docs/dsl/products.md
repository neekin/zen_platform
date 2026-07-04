# 产品形态

## 语法

```ruby
product :type, **options
```

## 支持的形态

### CRUD (默认)

标准的表格 + 表单模式。

```ruby
product :crud
```

### Kanban 看板

拖拽式看板视图，按枚举字段分列。

```ruby
field :status, :enum, values: %w[todo doing done]
product :kanban
```

生成器：`rails generate zen:admin Task --product=kanban`

### Calendar 日历

日历视图，按日期字段分组显示。

```ruby
field :start_date, :date
product :calendar
```

生成器：`rails generate zen:admin Event --product=calendar`

### Gallery 画廊

网格布局图片卡片。

```ruby
field :cover, :image
product :gallery
```

生成器：`rails generate zen:admin Photo --product=gallery`

### Soft Delete 软删除

归档而非物理删除。

```ruby
field :archived_at, :datetime
product :soft_delete, column: :archived_at
```

自动生成：
- `scope :active` — 只返回未归档记录
- `default_scope` — 默认排除已归档记录
- `archive!` — 归档记录
- `restore!` — 恢复记录
- `archived?` — 检查是否已归档
