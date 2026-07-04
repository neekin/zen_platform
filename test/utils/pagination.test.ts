import { describe, it, expect } from 'vitest'

describe('Pagination logic', () => {
  it('calculates correct offset', () => {
    const page = 3
    const perPage = 20
    const offset = (page - 1) * perPage
    expect(offset).toBe(40)
  })

  it('clamps per_page to max 100', () => {
    const perPage = Math.min(500, 100)
    expect(perPage).toBe(100)
  })

  it('calculates total pages', () => {
    const total = 95
    const perPage = 20
    const totalPages = Math.ceil(total / perPage)
    expect(totalPages).toBe(5)
  })

  it('handles empty result set', () => {
    const total = 0
    const perPage = 20
    const totalPages = Math.ceil(total / perPage)
    expect(totalPages).toBe(0)
  })
})

describe('Filter logic', () => {
  it('builds filter params', () => {
    const filters = { status: 'published', category_id: 1 }
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, String(v))
    })
    expect(params.get('status')).toBe('published')
    expect(params.get('category_id')).toBe('1')
  })

  it('skips empty filters', () => {
    const filters = { status: '', category_id: null }
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, String(v))
    })
    expect(params.toString()).toBe('')
  })
})
