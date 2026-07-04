import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PermissionGuard from '../../../app/frontend/components/auth/PermissionGuard'

vi.mock('@inertiajs/react', () => ({
  usePage: () => ({
    props: {
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        roles: ['admin'],
      },
    },
  }),
}))

describe('PermissionGuard', () => {
  it('renders children when user has matching role', () => {
    render(
      <PermissionGuard roles={['admin']}>
        <button>Admin Button</button>
      </PermissionGuard>
    )
    expect(screen.getByText('Admin Button')).toBeInTheDocument()
  })

  it('hides children when user lacks role', () => {
    render(
      <PermissionGuard roles={['super_admin']}>
        <button>Super Admin Button</button>
      </PermissionGuard>
    )
    expect(screen.queryByText('Super Admin Button')).not.toBeInTheDocument()
  })

  it('renders children when no roles specified', () => {
    render(
      <PermissionGuard>
        <button>Always Visible</button>
      </PermissionGuard>
    )
    expect(screen.getByText('Always Visible')).toBeInTheDocument()
  })
})
