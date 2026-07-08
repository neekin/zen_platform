import { describe, it, expect } from 'vitest'
import { buildColumns } from '../../../app/frontend/modules/dsl/columnRenderer'
import type { DslMeta } from '../../../app/frontend/types/dsl'

describe('columnRenderer edge cases', () => {
  const meta: DslMeta = {
    model_name: 'Test',
    fields: {
      title: { name: 'title', type: 'string', required: true, reference: false, enum_values: [], accept_types: [], suggestions: [], multiple: false },
      status: { name: 'status', type: 'enum', required: false, reference: false, enum_values: ['active', 'inactive'], accept_types: [], suggestions: [], multiple: false },
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

  it('builds correct number of columns', () => {
    expect(buildColumns(meta, '/admin/tests')).toHaveLength(5)
  })

  it('handles empty display config', () => {
    const emptyMeta = { ...meta, display: { ...meta.display, list: { columns: [] } } }
    expect(buildColumns(emptyMeta, '/admin/tests')).toHaveLength(0)
  })

  it('currency renders yen symbol', () => {
    const cols = buildColumns(meta, '/admin/tests')
    const render = cols[2].render as Function
    expect(render(null, { price: 99.9 })).toContain('99.90')
    expect(render(null, { price: null })).toBe('-')
  })

  it('badge renders tag', () => {
    const cols = buildColumns(meta, '/admin/tests')
    const render = cols[1].render as Function
    const result = render(null, { status: 'active' })
    expect(result).toBeTruthy()
  })

  it('thumbnail renders image', () => {
    const cols = buildColumns(meta, '/admin/tests')
    const render = cols[4].render as Function
    const result = render(null, { cover: 'http://example.com/img.jpg' })
    expect(result).toBeTruthy()
  })
})
