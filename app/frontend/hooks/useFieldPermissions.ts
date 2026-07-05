/**
 * 字段级权限 Hook
 *
 * 根据 meta.restricted_fields 和 meta.field_permissions 控制字段可见性
 */
import { usePage } from '@inertiajs/react'
import type { SharedProps } from '@/types'

interface UseFieldPermissionsOptions {
  restricted_fields?: string[]
}

export function useFieldPermissions(options: UseFieldPermissionsOptions = {}) {
  const { user } = usePage<SharedProps>().props
  const roles = user?.roles ?? []
  const isSuperAdmin = roles.includes('super_admin')
  const restrictedFields = options.restricted_fields ?? []

  /**
   * 检查字段是否可见
   * 如果字段在 restricted_fields 中，说明后端已经过滤过了
   * 这里主要是前端的二次保护
   */
  const canView = (fieldName: string): boolean => {
    if (isSuperAdmin) return true
    // restricted_fields 中的字段已经被后端过滤，不会出现在 meta 中
    // 这里检查是为了额外的安全保护
    return !restrictedFields.includes(fieldName)
  }

  /**
   * 过滤可见字段列表
   */
  const filterVisible = <T extends { name: string }>(fields: T[]): T[] => {
    return fields.filter(f => canView(f.name))
  }

  return {
    canView,
    filterVisible,
    isSuperAdmin,
    roles,
  }
}
