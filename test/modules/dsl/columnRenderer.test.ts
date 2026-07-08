import { describe, it, expect } from 'vitest'
import type { DslMeta } from '../../../app/frontend/types/dsl'
import { buildColumns } from '../../../app/frontend/modules/dsl/columnRenderer'

const mockMeta: DslMeta = {
  model_name: 'Article',
  fields: {
    title: { name: 'title', type: 'string', required: true, reference: false, enum_values: [], accept_types: [], suggestions: [], multiple: false },
    status: { name: 'status', type: 'enum', required: false, reference: false, enum_values: ['draft', 'published'], accept_types: [], suggestions: [], multiple: false },
    price: { name: 'price', type: 'decimal', required: false, reference: false, enum_values: [], accept_types: [], suggestions: [], multiple: false },
    created_at: { name: 'created_at', type: 'datetime', required: false, reference: false, enum_values: [], accept_types: [], suggestions: [], multiple: false },
    cover: { name: 'cover', type: 'image', required: false, reference: false, enum_values: [], accept_types: [], suggestions: [], multiple: false },
  },
  associations: {},
  display: {
    list: {
      columns: [
        { name: 'title', link: true },
        { name: 'status', badge: true },
        { name: 'price', format: 'currency' },
        { name: 'created_at', format: 'relative_time' },
        { name: 'cover', thumbnail: true },
      ],
    },
    form: { sections: [] },
    detail: { sections: [], associations: [] },
  },
  products: [],
}

describe('columnRenderer', () => {
  it('returns correct number of columns', () => {
    const columns = buildColumns(mockMeta, '/admin/articles')
    expect(columns).toHaveLength(5)
  })

  it('sets correct titles', () => {
    const columns = buildColumns(mockMeta, '/admin/articles')
    expect(columns[0].title).toBe('title')
    expect(columns[1].title).toBe('status')
    expect(columns[2].title).toBe('price')
  })

  it('creates render functions for link columns', () => {
    const columns = buildColumns(mockMeta, '/admin/articles')
    expect(columns[0].render).toBeDefined()
  })

  it('creates render functions for badge columns', () => {
    const columns = buildColumns(mockMeta, '/admin/articles')
    expect(columns[1].render).toBeDefined()
  })

  it('creates render functions for currency columns', () => {
    const columns = buildColumns(mockMeta, '/admin/articles')
    expect(columns[2].render).toBeDefined()
  })

  it('creates render functions for relative_time columns', () => {
    const columns = buildColumns(mockMeta, '/admin/articles')
    expect(columns[3].render).toBeDefined()
  })

  it('creates render functions for thumbnail columns', () => {
    const columns = buildColumns(mockMeta, '/admin/articles')
    expect(columns[4].render).toBeDefined()
  })

  it('formats currency correctly', () => {
    const columns = buildColumns(mockMeta, '/admin/articles')
    const renderFn = columns[2].render as Function
    const result = renderFn(null, { price: 99.99 })
    expect(result).toContain('99.99')
  })

  it('handles null currency', () => {
    const columns = buildColumns(mockMeta, '/admin/articles')
    const renderFn = columns[2].render as Function
    const result = renderFn(null, { price: null })
    expect(result).toBe('-')
  })
})
