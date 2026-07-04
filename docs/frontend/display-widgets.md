---
title: 展示组件
---

# 展示组件

## StatusBadge

状态标签组件，根据值自动选择颜色。

```tsx
import StatusBadge from '@/modules/admin/components/display/StatusBadge'

<StatusBadge value="published" />
```

| 值 | 颜色 |
|----|------|
| `draft` / `pending` / `todo` | 灰色 |
| `published` / `active` / `done` | 绿色 |
| `archived` / `inactive` | 橙色 |
| `error` / `failed` | 红色 |

## RelativeTime

相对时间显示组件。

```tsx
import RelativeTime from '@/modules/admin/components/display/RelativeTime'

<RelativeTime time="2026-07-04T10:00:00Z" />
// 输出："3 小时前"
```
