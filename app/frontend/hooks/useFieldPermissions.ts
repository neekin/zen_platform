/**
 * 字段级权限 Hook
 *
 * 根据用户角色和字段权限配置，控制字段的可见性和可编辑性
 */
import { usePage } from '@inertiajs/react'
import type { SharedProps } from '@/types'

interface FieldPermission {
  field: string
  action: 'view' | 'edit' | 'deny'
}

interface UseFieldPermissionsOptions {
  field_permissions?: FieldPermission[]
}

export function useFieldPermissions(options: UseFieldPermissionsOptions = {}) {
  const { user } = usePage<SharedProps>().props
  const roles = user?.roles ?? []
  const isSuperAdmin = roles.includes('super_admin')
  const fieldPermissions = options.field_permissions ?? []

  /**
   * 检查字段是否可见
   */
  const canView = (fieldName: string): boolean => {
    if (isSuperAdmin) return true
    const perm = fieldPermissions.find(p => p.field === fieldName)
    if (!perm) return true // 默认可见
    return perm.action !== 'deny'
  }

  /**
   * 检查字段是否可编辑
   */
  const canEdit = (fieldName: string): boolean => {
    if (isSuperAdmin) return true
    const perm = fieldPermissions.find(p => p.field === fieldName)
    if (!perm) return true // 默认可编辑
    return perm.action === 'edit'
  }

  /**
   * 检查字段是否只读
   */
  const isReadonly = (fieldName: string): boolean => {
    return canView(fieldName) && !canEdit(fieldName)
  }

  /**
   * 过滤可见字段列表
   */
  const filterVisible = <T extends { name: string }>(fields: T[]): T[] => {
    return fields.filter(f => canView(f.name))
  }

  /**
   * 获取字段禁用状态（用于表单）
   */
  const getFieldDisabled = (fieldName: string): boolean => {
    if (isSuperAdmin) return false
    return isReadonly(fieldName)
  }

  return {
    canView,
    canEdit,
    isReadonly,
    filterVisible,
    getFieldDisabled,
    isSuperAdmin,
    roles,
  }
}
