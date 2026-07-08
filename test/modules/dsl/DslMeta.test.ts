import { describe, it, expect } from 'vitest'
import type { DslMeta } from '../../../app/frontend/types/dsl'

describe('DslMeta types', () => {
  const mockMeta: DslMeta = {
    model_name: 'Article',
    fields: {
      title: { name: 'title', type: 'string', required: true, reference: false, enum_values: [], accept_types: [], suggestions: [], multiple: false },
      status: { name: 'status', type: 'enum', required: false, default: 'draft', reference: false, enum_values: ['draft', 'published', 'archived'], accept_types: [], suggestions: [], multiple: false },
      is_featured: { name: 'is_featured', type: 'boolean', required: false, default: false, reference: false, enum_values: [], accept_types: [], suggestions: [], multiple: false },
    },
    associations: {
      category: { name: 'category', type: 'belongs_to', foreign_key: 'category_id', target_class_name: 'Category', display_field: 'name', searchable: true, creatable: false },
    },
    display: {
      list: {
        columns: [
          { name: 'title', link: true },
          { name: 'status', badge: true },
          { name: 'created_at', format: 'relative_time' },
        ],
      },
      form: {
        sections: [
          { title: '基本信息', fields: [{ name: 'title', required: true }, { name: 'status', as: 'radio' }] },
          { title: '内容', fields: [{ name: 'body', as: 'rich_text' }] },
        ],
      },
      detail: { sections: [], associations: [] },
    },
    products: [],
  }

  it('has correct model_name', () => {
    expect(mockMeta.model_name).toBe('Article')
  })

  it('has fields with correct types', () => {
    expect(mockMeta.fields.title.type).toBe('string')
    expect(mockMeta.fields.status.type).toBe('enum')
    expect(mockMeta.fields.is_featured.type).toBe('boolean')
  })

  it('has enum_values for enum fields', () => {
    expect(mockMeta.fields.status.enum_values).toEqual(['draft', 'published', 'archived'])
  })

  it('has associations with correct structure', () => {
    expect(mockMeta.associations.category.type).toBe('belongs_to')
    expect(mockMeta.associations.category.target_class_name).toBe('Category')
    expect(mockMeta.associations.category.foreign_key).toBe('category_id')
  })

  it('has display config with list columns', () => {
    expect(mockMeta.display.list.columns).toHaveLength(3)
    expect(mockMeta.display.list.columns[0].link).toBe(true)
    expect(mockMeta.display.list.columns[1].badge).toBe(true)
  })

  it('has display config with form sections', () => {
    expect(mockMeta.display.form.sections).toHaveLength(2)
    expect(mockMeta.display.form.sections[0].title).toBe('基本信息')
    expect(mockMeta.display.form.sections[1].title).toBe('内容')
  })

  it('has empty products array', () => {
    expect(mockMeta.products).toEqual([])
  })
})
