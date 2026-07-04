# 展示配置

## 语法

```ruby
display do
  list { ... }
  form { ... }
  detail { ... }
end
```

## list — 列表配置

```ruby
list do
  column :title, link: true           # 可点击跳转
  column :status, badge: true         # 彩色标签
  column :price, format: :currency    # ¥ 前缀
  column :created_at, format: :relative_time  # 相对时间
  column :cover, thumbnail: true      # 图片缩略图
  column :category, display: :name    # 关联对象字段
end
```

### 列选项

| 选项 | 说明 |
|------|------|
| `link: true` | 标题列，点击跳转详情 |
| `badge: true` | 使用 StatusBadge 组件 |
| `format: :relative_time` | 显示相对时间 |
| `format: :currency` | ¥ 前缀 + 两位小数 |
| `thumbnail: true` | 图片缩略图 |
| `display: :name` | 显示关联对象的字段 |
| `width: 100` | 列宽度 |

## form — 表单配置

```ruby
form do
  section "基本信息" do
    field :title, required: true
    field :status, as: :radio
    field :is_featured, as: :switch
  end
  section "内容" do
    field :body, as: :rich_text
  end
end
```

### 字段选项 (`as:`)

| 值 | 组件 | 适用类型 |
|----|------|---------|
| `text` | ProFormText | string (默认) |
| `textarea` | ProFormTextArea | text |
| `rich_text` | RichTextEditor | rich_text |
| `number` | ProFormDigit | integer/decimal/float |
| `switch` | ProFormSwitch | boolean |
| `radio` | ProFormRadio.Group | enum |
| `select` | ProFormSelect | enum/reference |
| `date` | ProFormDatePicker | date |
| `datetime` | ProFormDateTimePicker | datetime |
| `image` | ImageUpload | image |
| `file` | FileUpload | file |
| `tags` | TagInput | tags |

## detail — 详情配置

```ruby
detail do
  section "基本信息" do
    field :title, as: :heading
    field :status, as: :badge
    field :created_at
  end
  section "内容" do
    field :body, as: :rich_text_viewer
  end
end
```
