import React from 'react'
import { usePermissions } from '@/hooks/usePermissions'

type PermissionGuardProps = {
  roles?: string[]
  requireAll?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

export default function PermissionGuard({
  roles = [],
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasRole, hasAnyRole } = usePermissions()

  if (roles.length === 0) return <>{children}</>

  const permitted = requireAll
    ? roles.every((r) => hasRole(r))
    : hasAnyRole(...roles)

  return <>{permitted ? children : fallback}</>
}
