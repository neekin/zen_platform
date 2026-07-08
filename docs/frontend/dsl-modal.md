---
title: DslModal
---

# DslModal

统一弹窗封装组件，限制高度不超过浏览器视口，内容区域自动滚动。

## 基本用法

```tsx
import DslModal from '@/modules/dsl/DslModal'

<DslModal
  title="编辑文章"
  open={modalOpen}
  onCancel={() => setModalOpen(false)}
  footer={null}
  width={800}
>
  <DslForm meta={meta} initialValues={editing} onFinish={handleFinish} />
</DslModal>
```

## Props

继承 antd `Modal` 所有属性，额外增加：

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `maxBodyHeight` | `string` | `calc(100vh - 200px)` | 内容区域最大高度 |

## 高度限制

Modal 模式下，弹窗高度不超过浏览器视口，内容区域自动滚动：

```css
max-height: calc(100vh - 200px);
overflow-y: auto;
```
