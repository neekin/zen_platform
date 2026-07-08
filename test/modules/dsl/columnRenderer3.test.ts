import { describe, it, expect } from 'vitest'
import { buildColumns } from '../../../app/frontend/modules/dsl/columnRenderer'
import type { DslMeta } from '../../../app/frontend/types/dsl'

describe('columnRenderer display field', () => {
  it('handles display field for association', () => {
    const meta: DslMeta = {
      model_name: 'Article',
      fields: {
        category: { name: 'category', type: 'string', required: false, reference: false, enum_values: [], accept_types: [], suggestions: [], multiple: false },
      },
      associations: {},
      display: {
        list: {
          columns: [
            { name: 'category', display: 'name' },
          ],
        },
        form: { sections: [] },
        detail: { sections: [], associations: [] },
      },
      products: [],
    }
    const cols = buildColumns(meta, '/admin/articles')
    expect(cols[0].dataIndex).toEqual(['category', 'name'])
  })

  it('handles width option', () => {
    const meta: DslMeta = {
      model_name: 'Test',
      fields: { id: { name: 'id', type: 'integer', required: false, reference: false, enum_values: [], accept_types: [], suggestions: [], multiple: false } },
      associations: {},
      display: {
        list: { columns: [{ name: 'id', width: 80 }] },
        form: { sections: [] },
        detail: { sections: [], associations: [] },
      },
      products: [],
    }
    const cols = buildColumns(meta, '/admin/tests')
    expect(cols[0].width).toBe(80)
  })
})
