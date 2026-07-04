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
import { DslTable } from '@/modules/dsl/DslTable'

<DslTable meta={zenMeta} data={articles} basePath="/admin/articles" createText="新建文章" />
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

## 后端数据来源

DSL 组件依赖后端 `zen_props` 方法注入的 `meta` prop：

```ruby
def index
  @articles = Article.all
  render inertia: "admin/articles/Index",
    props: zen_props(Article, articles: @articles.as_json)
end
```

`zen_props` 自动注入 `meta`（来自 `Article.zen_meta`）。
