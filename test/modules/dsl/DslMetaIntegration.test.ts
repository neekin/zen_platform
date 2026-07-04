import { describe, it, expect } from 'vitest'
import type { DslMeta } from '../../../app/frontend/types/dsl'

describe('DslMeta integration', () => {
  it('validates complete meta structure', () => {
    const meta: DslMeta = {
      model_name: 'Article',
      fields: {
        title: { name: 'title', type: 'string', required: true, reference: false, enum_values: [], accept_types: [], suggestions: [], multiple: false },
      },
      associations: {},
      display: {
        list: { columns: [{ name: 'title', link: true }] },
        form: { sections: [{ title: 'Info', fields: [{ name: 'title' }] }] },
        detail: { sections: [], associations: [] },
      },
      products: [],
    }
    expect(meta.model_name).toBe('Article')
    expect(meta.fields.title.required).toBe(true)
    expect(meta.display.list.columns).toHaveLength(1)
  })

  it('supports multiple form sections', () => {
    const meta: DslMeta = {
      model_name: 'Post',
      fields: {},
      associations: {},
      display: {
        list: { columns: [] },
        form: {
          sections: [
            { title: 'Basic', fields: [{ name: 'title' }] },
            { title: 'Content', fields: [{ name: 'body', as: 'rich_text' }] },
            { title: 'Settings', fields: [{ name: 'status', as: 'radio' }] },
          ],
        },
        detail: { sections: [], associations: [] },
      },
      products: [],
    }
    expect(meta.display.form.sections).toHaveLength(3)
  })

  it('supports multiple associations', () => {
    const meta: DslMeta = {
      model_name: 'Article',
      fields: {},
      associations: {
        author: { name: 'author', type: 'belongs_to', foreign_key: 'author_id', target_class_name: 'User', display_field: 'name', searchable: true, creatable: false },
        category: { name: 'category', type: 'belongs_to', foreign_key: 'category_id', target_class_name: 'Category', display_field: 'name', searchable: true, creatable: false },
        comments: { name: 'comments', type: 'has_many', foreign_key: 'article_id', target_class_name: 'Comment', display_field: 'content', searchable: false, creatable: false },
      },
      display: { list: { columns: [] }, form: { sections: [] }, detail: { sections: [], associations: [] } },
      products: [],
    }
    expect(Object.keys(meta.associations)).toHaveLength(3)
    expect(meta.associations.author.type).toBe('belongs_to')
    expect(meta.associations.comments.type).toBe('has_many')
  })

  it('supports product configurations', () => {
    const meta: DslMeta = {
      model_name: 'Task',
      fields: {},
      associations: {},
      display: { list: { columns: [] }, form: { sections: [] }, detail: { sections: [], associations: [] } },
      products: [
        { type: 'kanban', options: { group_by: 'status' } },
      ],
    }
    expect(meta.products).toHaveLength(1)
    expect(meta.products[0].type).toBe('kanban')
  })
})
