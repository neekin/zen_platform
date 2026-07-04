import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from 'antd'

// Mock @inertiajs/react router
vi.mock('@inertiajs/react', () => ({
  router: {
    visit: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    reload: vi.fn(),
  },
}))

// Mock AdminLayout to just render children
vi.mock('../../../app/frontend/layouts/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock DSL components to avoid pro-components import chain in test env
vi.mock('../../../app/frontend/modules/dsl', () => ({
  DslTable: ({ meta, data, createText }: any) => (
    <div>
      <button>{createText || '新建'}</button>
      <table>
        <tbody>
          {data?.map((item: any) => (
            <tr key={item.id}><td>{item.title}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  DslForm: ({ initialValues, submitText }: any) => (
    <form>{submitText || '提交'} - {initialValues?.title || ''}</form>
  ),
  DslModal: ({ children, title, open }: any) => open ? <div data-testid="dsl-modal"><h2>{title}</h2>{children}</div> : null,
}))

import ArticlesIndex from '../../../app/frontend/pages/admin/articles/Index'

const mockMeta = {
  modelName: 'Article',
  fields: [
    { name: 'title', type: 'string', display: true },
    { name: 'status', type: 'enum', display: true, values: ['draft', 'published'] },
  ],
  associations: [],
  display: { titleField: 'title', indexFields: ['title', 'status'] },
}

function renderWithProviders(ui: React.ReactElement) {
  return render(<App>{ui}</App>)
}

describe('ArticlesIndex', () => {
  it('renders without crashing', () => {
    renderWithProviders(
      <ArticlesIndex meta={mockMeta as any} articles={[]} />
    )
    // DslTable should render the create button
    expect(screen.getByText('新建Article')).toBeInTheDocument()
  })

  it('renders article data in table', () => {
    const articles = [
      { id: 1, title: '测试文章', status: 'draft' },
      { id: 2, title: '已发布文章', status: 'published' },
    ]
    renderWithProviders(
      <ArticlesIndex meta={mockMeta as any} articles={articles} />
    )
    expect(screen.getByText('测试文章')).toBeInTheDocument()
    expect(screen.getByText('已发布文章')).toBeInTheDocument()
  })
})
