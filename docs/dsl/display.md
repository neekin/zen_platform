---
title: 展示配置
---

# 展示配置

`display` 块定义列表页和表单页的渲染方式。

## 语法

```ruby
display do
  list do
    # 列表页配置
  end
  form do
    # 表单页配置
  end
  detail do
    # 详情页配置
  end
end
```

## 列表配置

### column（列表列）

```ruby
display do
  list do
    column :title, link: true          # 可点击跳转到详情页
    column :status, badge: true        # 渲染为彩色标签
    column :price, format: :currency   # ¥ 前缀 + 两位小数
    column :created_at, format: :relative_time  # 相对时间
    column :cover, thumbnail: true     # 图片缩略图
    column :category, display: :name   # 显示关联对象的字段
  end
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

## 表单配置

### section（表单分区）

```ruby
display do
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
end
```

### field 覆盖

DSL 中 `field` 的表单表现可以在 `display` 中覆盖：

```ruby
field :status, :enum, values: %w[draft published]

display do
  form do
    field :status, as: :select  # 覆盖为下拉框（默认 radio）
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

## 完整示例

```ruby
class Article < ApplicationRecord
  include Zen::ModelDsl

  field :title, :string, required: true
  field :body, :rich_text
  field :status, :enum, values: %w[draft published archived]
  belongs_to :category

  display do
    list do
      column :title, link: true
      column :status, badge: true
      column :category, display: :name
      column :created_at, format: :relative_time
    end
    form do
      section "基本信息" do
        field :title, required: true
        field :status, as: :radio
        field :category_id, as: :reference
      end
      section "内容" do
        field :body, as: :rich_text
      end
    end
    detail do
      section "基本信息" do
        field :title, as: :heading
        field :status, as: :badge
      end
      section "内容" do
        field :body, as: :rich_text_viewer
      end
    end
  end
end
```
