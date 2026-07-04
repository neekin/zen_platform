import { describe, it, expect } from 'vitest'
import { buildColumns } from '../../../app/frontend/modules/dsl/columnRenderer'
import type { DslMeta } from '../../../app/frontend/types/dsl'

const mockMeta: DslMeta = {
  model_name: 'Article',
  fields: {
    title: { name: 'title', type: 'string', required: true, reference: false, enum_values: [], accept_types: [], suggestions: [], multiple: false },
    status: { name: 'status', type: 'enum', required: false, reference: false, enum_values: ['draft', 'published'], accept_types: [], suggestions: [], multiple: false },
    price: { name: 'price', type: 'decimal', required: false, reference: false, enum_values: [], accept_types: [], suggestions: [], multiple: false },
    created_at: { name: 'created_at', type: 'datetime', required: false, reference: false, enum_values: [], accept_types: [], suggestions: [], multiple: false },
  },
  associations: {},
  display: {
    list: {
      columns: [
        { name: 'title', link: true },
        { name: 'status', badge: true },
        { name: 'price', format: 'currency' },
        { name: 'created_at', format: 'relative_time' },
      ],
    },
    form: { sections: [] },
    detail: { sections: [], associations: [] },
  },
  products: [],
}

describe('buildColumns', () => {
  it('returns correct number of columns', () => {
    const columns = buildColumns(mockMeta, '/admin/articles')
    expect(columns).toHaveLength(4)
  })

  it('sets correct titles', () => {
    const columns = buildColumns(mockMeta, '/admin/articles')
    expect(columns[0].title).toBe('title')
    expect(columns[1].title).toBe('status')
  })

  it('sets correct dataIndex', () => {
    const columns = buildColumns(mockMeta, '/admin/articles')
    expect(columns[0].dataIndex).toBe('title')
    expect(columns[2].dataIndex).toBe('price')
  })

  it('creates render functions for special columns', () => {
    const columns = buildColumns(mockMeta, '/admin/articles')
    expect(columns[0].render).toBeDefined() // link
    expect(columns[1].render).toBeDefined() // badge
    expect(columns[2].render).toBeDefined() // currency
    expect(columns[3].render).toBeDefined() // relative_time
  })
})
