---
title: 权限组件
---

# PermissionGuard

前端权限守卫组件，根据当前用户角色控制元素显示/隐藏。

## 基本用法

```tsx
import { PermissionGuard } from '@/components/auth/PermissionGuard'

<PermissionGuard roles={['admin', 'editor']}>
  <Button type="primary">新建文章</Button>
</PermissionGuard>
```

用户无指定角色时，内部内容不渲染。

## Props

| Prop | 类型 | 必填 | 说明 |
|------|------|------|------|
| `roles` | `string[]` | 否 | 允许的角色列表 |
| `requireAll` | `boolean` | 否 | 是否需要所有角色，默认 false（任一即可） |
| `fallback` | `ReactNode` | 否 | 无权限时显示的内容 |

## usePermissions Hook

```tsx
import { usePermissions } from '@/hooks/usePermissions'

const { hasRole, isAdmin, isEditor } = usePermissions()
```

## super_admin 行为

`super_admin` 角色自动通过所有权限检查。
