# 字段定义

## 语法

```ruby
field :name, :type, **options
```

## 支持的类型

| 类型 | 说明 | 表单组件 |
|------|------|---------|
| `:string` | 单行文本 | ProFormText |
| `:text` | 多行文本 | ProFormTextArea |
| `:rich_text` | 富文本 | RichTextEditor |
| `:integer` | 整数 | ProFormDigit |
| `:decimal` | 小数 | ProFormDigit |
| `:float` | 浮点数 | ProFormDigit |
| `:boolean` | 布尔值 | ProFormSwitch |
| `:date` | 日期 | ProFormDatePicker |
| `:datetime` | 日期时间 | ProFormDateTimePicker |
| `:enum` | 枚举 | ProFormRadio / ProFormSelect |
| `:image` | 图片 | ImageUpload |
| `:file` | 文件 | FileUpload |
| `:tags` | 标签 | TagInput |
| `:json` | JSON | JsonEditor |
| `:color` | 颜色 | ColorPicker |
| `:url` | URL | ProFormText |
| `:email` | 邮箱 | ProFormText |
| `:reference` | 关联引用 | ProFormSelect |

## 选项

| 选项 | 说明 | 示例 |
|------|------|------|
| `required` | 必填 | `field :title, :string, required: true` |
| `default` | 默认值 | `field :status, :enum, default: "draft"` |
| `placeholder` | 占位符 | `field :title, :string, placeholder: "请输入标题"` |
| `values` | 枚举值 | `field :status, :enum, values: %w[draft published]` |
| `accept` | 文件类型 | `field :cover, :image, accept: %w[image/jpeg image/png]` |
| `max_size` | 最大文件大小 | `field :cover, :image, max_size: 10.megabytes` |

## enum 自动集成

```ruby
# 这行 DSL 会自动调用 ActiveRecord enum
field :status, :enum, values: %w[draft published archived]

# 等价于手动写：
# enum :status, { draft: 0, published: 1, archived: 2 }
```
