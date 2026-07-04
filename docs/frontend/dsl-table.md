---
title: DslTable
---

# DslTable

DSL 驱动的表格组件，根据 `zen_meta` 自动渲染列、操作按钮。

## 基本用法

```tsx
import { DslTable } from '@/modules/dsl/DslTable'

<DslTable
  meta={meta}
  data={articles}
  basePath="/admin/articles"
  createText="新建文章"
  onCreate={() => setModalOpen(true)}
  onEdit={(record) => { setEditing(record); setModalOpen(true) }}
/>
```

## Props

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `meta` | `DslMeta` | 是 | `zen_meta` JSON |
| `data` | `Record<string, any>[]` | 是 | 表格数据 |
| `basePath` | `string` | 是 | 资源基础路径 |
| `createText` | `string` | 否 | 新建按钮文字 |
| `onCreate` | `() => void` | 否 | 新建回调（modal 模式） |
| `onEdit` | `(record) => void` | 否 | 编辑回调（modal 模式） |
| `showActions` | `boolean` | 否 | 是否显示操作列，默认 true |
| `serverSide` | `boolean` | 否 | 服务端分页模式 |
| `pagination` | `PaginationConfig` | 否 | 分页配置 |
| `onServerChange` | `(params) => void` | 否 | 服务端请求回调 |
| `rowSelection` | `object` | 否 | 行选择配置 |
| `onBulkDelete` | `(ids) => void` | 否 | 批量删除回调 |

## 自动渲染逻辑

DslTable 读取 `meta.display.list.columns` 自动生成列：

- `link: true` → 标题列，点击跳转详情
- `badge: true` → 彩色标签
- `format: :relative_time` → 相对时间
- `format: :currency` → ¥ 前缀
- `thumbnail: true` → 图片缩略图
