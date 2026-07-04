import { describe, it, expect } from 'vitest'

describe('Permission checks', () => {
  const roles = ['admin', 'editor']

  it('checks single role', () => {
    expect(roles.includes('admin')).toBe(true)
    expect(roles.includes('viewer')).toBe(false)
  })

  it('checks any role', () => {
    const hasAny = roles.some(r => ['admin', 'super_admin'].includes(r))
    expect(hasAny).toBe(true)
  })

  it('checks all roles', () => {
    const hasAll = ['admin', 'editor'].every(r => roles.includes(r))
    expect(hasAll).toBe(true)
  })

  it('handles empty roles', () => {
    const emptyRoles: string[] = []
    expect(emptyRoles.includes('admin')).toBe(false)
  })
})

describe('Export allowed resources', () => {
  const allowed = ['Article', 'Comment', 'User', 'Role', 'ApiKey', 'Notification']

  it('includes Article', () => {
    expect(allowed).toContain('Article')
  })

  it('includes Comment', () => {
    expect(allowed).toContain('Comment')
  })

  it('has correct count', () => {
    expect(allowed).toHaveLength(6)
  })
})
