---
title: 前端组件
---

# 前端组件

Zen Platform 前端基于 React 19 + Ant Design 6 + Pro Components，提供两层组件：

## 组件层次

| 层级 | 组件 | 说明 |
|------|------|------|
| DSL 层 | DslTable / DslForm / DslModal | 读取 `zen_meta` 自动渲染，无需手写列和字段 |
| 基础层 | ImageUpload / FileUpload / TagInput / StatusBadge / RelativeTime | 独立可用，也可被 DSL 层调用 |

## 使用方式

### DSL 层（推荐）

```tsx
import { DslTable, DslForm, DslModal } from '@/modules/dsl'

// 表格
<DslTable meta={zenMeta} data={articles} basePath="/admin/articles" createText="新建文章" />

// 表单
<DslForm meta={zenMeta} initialValues={article} onFinish={handleSubmit} />

// 弹窗
<DslModal title="编辑" open={open} onCancel={onClose}>
  <DslForm meta={zenMeta} initialValues={article} onFinish={handleSubmit} />
</DslModal>
```

### 基础层（自定义场景）

```tsx
import { ImageUpload } from '@/modules/admin/components/form/ImageUpload'

<ImageUpload value={url} onChange={setUrl} />
```

## 组件清单

| 组件 | 路径 | 用途 |
|------|------|------|
| DslTable | `@/modules/dsl/DslTable` | DSL 驱动的表格 |
| DslForm | `@/modules/dsl/DslForm` | DSL 驱动的表单 |
| DslModal | `@/modules/dsl/DslModal` | 弹窗封装 |
| ImageUpload | `@/modules/admin/components/form/ImageUpload` | 图片上传 |
| FileUpload | `@/modules/admin/components/form/FileUpload` | 文件上传 |
| TagInput | `@/modules/admin/components/form/TagInput` | 标签输入 |
| StatusBadge | `@/modules/admin/components/display/StatusBadge` | 状态标签 |
| RelativeTime | `@/modules/admin/components/display/RelativeTime` | 相对时间 |
| PermissionGuard | `@/components/auth/PermissionGuard` | 权限守卫 |
| RichTextEditor | `@/modules/content` | 富文本编辑器 |

## 自定义字段类型

通过 Plugin System 可以注册自定义字段类型：

```tsx
import { registerFieldType } from '@/modules/dsl'
import MapPicker from '@/components/MapPicker'
import MapView from '@/components/MapView'

registerFieldType('map', {
  FormComponent: MapPicker,
  DisplayComponent: MapView,
  ColumnComponent: MapPreview,
  parse: (value) => JSON.parse(value),
  serialize: (value) => JSON.stringify(value),
})
```

**注册选项：**

| 选项 | 说明 |
|------|------|
| `FormComponent` | 表单编辑组件（必填） |
| `DisplayComponent` | 只读展示组件 |
| `ColumnComponent` | 列表列渲染组件 |
| `parse` | 存储值 → 组件值 |
| `serialize` | 组件值 → 存储值 |
| `defaultProps` | 默认属性 |

**API：**

```tsx
import { registerFieldType, getFieldType, hasFieldType, parseFieldValue, serializeFieldValue } from '@/modules/dsl'
```

## 字段联动

DslForm 支持三种字段联动条件，在 Model DSL 中声明：

```ruby
field :end_date, :date,
  visible_when: { status: "published" },
  disabled_when: { locked: true },
  required_when: { type: "important" }
```

前端自动根据表单值动态计算字段的可见性、禁用状态和必填状态。

## Hooks

| Hook | 用途 |
|------|------|
| `usePermissions` | 角色/权限检查 |
| `useFieldConditions` | 字段联动条件计算 |
| `useNotifications` | 实时通知订阅 |
| `useTheme` | 主题切换 |
| `useZenConfig` | Zen 配置 |

## 后端数据来源

DSL 组件依赖后端 `zen_props` 方法注入的 `meta` prop：

```ruby
def index
  @articles = Article.all
  render inertia: "admin/articles/Index",
    props: zen_props(Article, articles: @articles.as_json)
end
```

`zen_props` 自动注入 `meta`（来自 `Article.zen_meta(current_user)`），并根据用户角色过滤字段。
