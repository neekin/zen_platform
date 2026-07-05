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
| 自定义 | 通过 Plugin System 注册 | 自定义组件 |

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

## 字段权限（visible_if）

使用 `visible_if` 选项可以基于当前用户角色控制字段可见性：

```ruby
class Product < ApplicationRecord
  include Zen::ModelDsl

  field :name, :string, required: true
  field :price, :decimal, visible_if: ->(user) { user.has_any_role?(:admin, :finance) }
  field :cost, :decimal, visible_if: ->(user) { user.has_role?(:admin) }
  field :internal_notes, :text, visible_if: ->(user) { user.has_role?(:admin) }
end
```

**说明：**
- `visible_if` 接收一个 Lambda，参数是当前用户对象
- 返回 `true` 表示字段可见，`false` 表示隐藏
- 使用 Rolify 的 `has_role?`、`has_any_role?` 等方法
- `super_admin` 角色始终可见所有字段
- 后端在 `zen_meta(user)` 中过滤字段，前端自动只渲染可见字段

**权限检查顺序：**
1. `super_admin` → 绕过所有检查
2. `visible_if` Lambda → 动态判断
3. 默认 → 可见

## 字段联动条件

### visible_when（显示条件）

当指定字段满足条件时显示：

```ruby
# 简单值匹配
field :end_date, :date, visible_when: { status: "published" }

# 数组匹配（任一满足）
field :reason, :text, visible_when: { status: ["rejected", "cancelled"] }

# 多条件（AND 逻辑）
field :priority, :enum, visible_when: { status: "published", type: "urgent" }
```

### disabled_when（禁用条件）

当指定字段满足条件时禁用：

```ruby
# 已验证时禁用邮箱字段
field :email, :string, disabled_when: { verified: true }

# 已发布时禁用价格字段
field :price, :decimal, disabled_when: { status: "published" }

# 多条件
field :discount, :decimal, disabled_when: { status: "published", locked: true }
```

### required_when（必填条件）

当指定字段满足条件时变为必填：

```ruby
# 拒绝时必须填写原因
field :reason, :text, required_when: { status: "rejected" }

# 短信联系时必须填手机号
field :phone, :string, required_when: { contact_method: "sms" }

# 多条件
field :notes, :text, required_when: { status: "published", type: "important" }
```

### 组合使用

```ruby
field :end_date, :date,
  visible_when: { status: "published" },
  disabled_when: { locked: true },
  required_when: { type: "important" }
```

### 操作符

除了简单值匹配，还支持操作符：

```ruby
# 大于
field :discount, :decimal, visible_when: { price: { operator: "gt", value: 100 } }

# 包含
field :notes, :text, visible_when: { tags: { operator: "contains", value: "vip" } }

# 非空
field :reason, :text, visible_when: { rejected_at: { operator: "notEmpty" } }
```

| 操作符 | 说明 | 示例 |
|--------|------|------|
| `eq` | 等于 | `{ operator: "eq", value: "draft" }` |
| `neq` | 不等于 | `{ operator: "neq", value: "published" }` |
| `in` | 在数组中 | `{ operator: "in", value: ["draft", "review"] }` |
| `notIn` | 不在数组中 | `{ operator: "notIn", value: ["archived"] }` |
| `gt` | 大于 | `{ operator: "gt", value: 100 }` |
| `gte` | 大于等于 | `{ operator: "gte", value: 0 }` |
| `lt` | 小于 | `{ operator: "lt", value: 1000 }` |
| `lte` | 小于等于 | `{ operator: "lte", value: 999 }` |
| `contains` | 包含字符串 | `{ operator: "contains", value: "vip" }` |
| `notEmpty` | 非空 | `{ operator: "notEmpty" }` |
| `empty` | 为空 | `{ operator: "empty" }` |

## 自定义字段类型

通过 Plugin System 可以注册自定义字段类型：

```tsx
// app/frontend/entrypoints/fieldTypes.ts
import { registerFieldType } from '@/modules/dsl'
import MapPicker from '@/components/MapPicker'
import MapView from '@/components/MapView'

registerFieldType('map', {
  FormComponent: MapPicker,      // 表单组件
  DisplayComponent: MapView,     // 展示组件
  ColumnComponent: MapPreview,   // 列表组件（可选）
  parse: (value) => JSON.parse(value),      // 反序列化
  serialize: (value) => JSON.stringify(value), // 序列化
})
```

```ruby
# Model DSL 中使用
class Store < ApplicationRecord
  include Zen::ModelDsl

  field :name, :string, required: true
  field :location, :map  # 使用自定义类型
end
```

**注册选项：**

| 选项 | 说明 | 必填 |
|------|------|------|
| `FormComponent` | 表单编辑组件 | ✅ |
| `DisplayComponent` | 只读展示组件 | ❌ |
| `ColumnComponent` | 列表列渲染组件 | ❌ |
| `parse` | 存储值 → 组件值 | ❌ |
| `serialize` | 组件值 → 存储值 | ❌ |
| `defaultProps` | 默认属性 | ❌ |
| `searchable` | 是否支持搜索 | ❌ |

**API：**

```tsx
import {
  registerFieldType,
  getFieldType,
  hasFieldType,
  parseFieldValue,
  serializeFieldValue,
} from '@/modules/dsl'
```
