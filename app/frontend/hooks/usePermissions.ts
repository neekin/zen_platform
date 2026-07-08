import { usePage } from '@inertiajs/react'

export function usePermissions() {
  const { user } = usePage().props

  const roles = user?.roles ?? []

  const hasRole = (role: string) => roles.includes(role)

  const hasAnyRole = (...roleNames: string[]) =>
    roleNames.some((r) => roles.includes(r))

  const isAdmin = hasAnyRole('super_admin', 'admin')
  const isSuperAdmin = hasRole('super_admin')
  const isEditor = hasRole('editor') || isAdmin
  const isViewer = hasRole('viewer')

  return {
    roles,
    hasRole,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    isEditor,
    isViewer,
  }
}
