import { describe, it, expect } from 'vitest'
import type { DslMeta } from '../../../app/frontend/types/dsl'

describe('DslFormField type inference', () => {
  const meta: DslMeta = {
    model_name: 'TestModel',
    fields: {
      name: { name: 'name', type: 'string', required: true, reference: false, enum_values: [], accept_types: [], suggestions: [], multiple: false },
      status: { name: 'status', type: 'enum', required: false, reference: false, enum_values: ['draft', 'published'], accept_types: [], suggestions: [], multiple: false },
      price: { name: 'price', type: 'decimal', required: false, reference: false, enum_values: [], accept_types: [], suggestions: [], multiple: false },
      active: { name: 'active', type: 'boolean', required: false, reference: false, enum_values: [], accept_types: [], suggestions: [], multiple: false },
      category_id: { name: 'category_id', type: 'reference', required: false, reference: true, target_model: 'Category', enum_values: [], accept_types: [], suggestions: [], multiple: false },
    },
    associations: {
      category: { name: 'category', type: 'belongs_to', foreign_key: 'category_id', target_class_name: 'Category', display_field: 'name', searchable: true, creatable: false },
    },
    display: {
      list: { columns: [] },
      form: {
        sections: [
          {
            title: 'Basic',
            fields: [
              { name: 'name', required: true },
              { name: 'status', as: 'radio' },
              { name: 'active', as: 'switch' },
              { name: 'category_id' },
            ],
          },
        ],
      },
      detail: { sections: [], associations: [] },
    },
    products: [],
  }

  it('identifies required fields', () => {
    expect(meta.fields.name.required).toBe(true)
    expect(meta.fields.status.required).toBe(false)
  })

  it('identifies enum fields with values', () => {
    expect(meta.fields.status.type).toBe('enum')
    expect(meta.fields.status.enum_values).toEqual(['draft', 'published'])
  })

  it('identifies reference fields', () => {
    expect(meta.fields.category_id.reference).toBe(true)
    expect(meta.fields.category_id.target_model).toBe('Category')
  })

  it('finds association for foreign key', () => {
    const assoc = meta.associations['category']
    expect(assoc).toBeDefined()
    expect(assoc.type).toBe('belongs_to')
  })

  it('has correct form sections', () => {
    expect(meta.display.form.sections).toHaveLength(1)
    expect(meta.display.form.sections[0].title).toBe('Basic')
    expect(meta.display.form.sections[0].fields).toHaveLength(4)
  })
})
