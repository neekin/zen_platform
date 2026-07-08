import { describe, it, expect } from 'vitest'

describe('Status color mapping', () => {
  const colors: Record<string, string> = {
    draft: 'default',
    published: 'green',
    archived: 'red',
    active: 'green',
    inactive: 'orange',
    todo: 'blue',
    doing: 'processing',
    done: 'success',
  }

  it('maps draft to default', () => {
    expect(colors['draft']).toBe('default')
  })

  it('maps published to green', () => {
    expect(colors['published']).toBe('green')
  })

  it('maps archived to red', () => {
    expect(colors['archived']).toBe('red')
  })

  it('returns undefined for unknown status', () => {
    expect(colors['unknown']).toBeUndefined()
  })
})

describe('Action labels', () => {
  const labels: Record<string, string> = {
    index: '查看列表',
    show: '查看详情',
    create: '创建',
    update: '编辑',
    destroy: '删除',
    restore: '还原',
  }

  it('maps index to 查看列表', () => {
    expect(labels['index']).toBe('查看列表')
  })

  it('maps destroy to 删除', () => {
    expect(labels['destroy']).toBe('删除')
  })
})
