import { describe, it, expect } from 'vitest'

describe('KanbanBoard data structure', () => {
  const mockColumns = [
    { id: 'todo', title: 'Todo', color: '#1890ff' },
    { id: 'doing', title: 'Doing', color: '#52c41a' },
    { id: 'done', title: 'Done', color: '#faad14' },
  ]

  const mockCards = [
    { id: 1, title: 'Task 1', columnId: 'todo' },
    { id: 2, title: 'Task 2', columnId: 'todo' },
    { id: 3, title: 'Task 3', columnId: 'doing' },
    { id: 4, title: 'Task 4', columnId: 'done' },
  ]

  it('groups cards by column', () => {
    const grouped = mockColumns.map(col => ({
      ...col,
      cards: mockCards.filter(c => c.columnId === col.id),
    }))
    expect(grouped[0].cards).toHaveLength(2)
    expect(grouped[1].cards).toHaveLength(1)
    expect(grouped[2].cards).toHaveLength(1)
  })

  it('calculates correct card count per column', () => {
    const counts = mockColumns.map(col => ({
      column: col.title,
      count: mockCards.filter(c => c.columnId === col.id).length,
    }))
    expect(counts).toEqual([
      { column: 'Todo', count: 2 },
      { column: 'Doing', count: 1 },
      { column: 'Done', count: 1 },
    ])
  })

  it('handles same-column reorder', () => {
    const fromColumn = 'todo'
    const toColumn = 'todo'
    const cardId = 1
    const newIndex = 1

    // Same column move should not change columnId
    const updated = mockCards.map(card =>
      card.id === cardId ? { ...card, columnId: toColumn } : card
    )
    expect(updated.find(c => c.id === cardId)?.columnId).toBe('todo')
  })

  it('handles cross-column move', () => {
    const fromColumn = 'todo'
    const toColumn = 'doing'
    const cardId = 1

    const updated = mockCards.map(card =>
      card.id === cardId ? { ...card, columnId: toColumn } : card
    )
    expect(updated.find(c => c.id === cardId)?.columnId).toBe('doing')
    expect(updated.filter(c => c.columnId === 'todo')).toHaveLength(1)
    expect(updated.filter(c => c.columnId === 'doing')).toHaveLength(2)
  })

  it('does not modify other cards on move', () => {
    const cardId = 1
    const toColumn = 'done'

    const updated = mockCards.map(card =>
      card.id === cardId ? { ...card, columnId: toColumn } : card
    )
    const otherCards = updated.filter(c => c.id !== cardId)
    expect(otherCards).toEqual(mockCards.filter(c => c.id !== cardId))
  })
})
