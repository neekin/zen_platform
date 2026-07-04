---
title: DslForm
---

# DslForm

DSL 驱动的表单组件，根据 `zen_meta` 自动渲染分区、字段、验证规则。

## 基本用法

```tsx
import { DslForm } from '@/modules/dsl/DslForm'

<DslForm
  meta={meta}
  initialValues={editing || {}}
  onFinish={handleFinish}
  associations={{ category: categories.map(c => ({ label: c.name, value: c.id })) }}
  submitText={editing ? '更新' : '创建'}
/>
```

## Props

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `meta` | `DslMeta` | 是 | `zen_meta` JSON |
| `initialValues` | `Record<string, any>` | 否 | 表单初始值 |
| `onFinish` | `(values) => Promise<boolean \| void>` | 是 | 提交回调 |
| `associations` | `Record<string, Array<{label, value}>>` | 否 | 关联数据源 |
| `submitText` | `string` | 否 | 提交按钮文字 |
| `disabled` | `boolean` | 否 | 是否禁用 |

## 字段类型映射

| DSL `as:` | 前端组件 |
|-----------|---------|
| `text` | ProFormText |
| `textarea` | ProFormTextArea |
| `rich_text` | RichTextEditor |
| `number` | ProFormDigit |
| `switch` | ProFormSwitch |
| `radio` | ProFormRadio.Group |
| `select` | ProFormSelect |
| `date` | ProFormDatePicker |
| `datetime` | ProFormDateTimePicker |
