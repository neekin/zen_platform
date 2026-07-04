import { describe, it, expect } from 'vitest'

describe('KanbanBoard data transformations', () => {
  const columns = [
    { id: 'todo', title: 'Todo', color: '#1890ff' },
    { id: 'doing', title: 'Doing', color: '#52c41a' },
    { id: 'done', title: 'Done', color: '#faad14' },
  ]

  const cards = [
    { id: 1, title: 'Task 1', columnId: 'todo' },
    { id: 2, title: 'Task 2', columnId: 'todo' },
    { id: 3, title: 'Task 3', columnId: 'doing' },
    { id: 4, title: 'Task 4', columnId: 'done' },
  ]

  it('groups cards by column', () => {
    const grouped = columns.map(col => ({
      ...col,
      cards: cards.filter(c => c.columnId === col.id),
    }))
    expect(grouped[0].cards).toHaveLength(2)
    expect(grouped[1].cards).toHaveLength(1)
    expect(grouped[2].cards).toHaveLength(1)
  })

  it('handles same-column move', () => {
    const updated = cards.map(card =>
      card.id === 1 ? { ...card, columnId: 'todo' } : card
    )
    expect(updated.find(c => c.id === 1)?.columnId).toBe('todo')
  })

  it('handles cross-column move', () => {
    const updated = cards.map(card =>
      card.id === 1 ? { ...card, columnId: 'doing' } : card
    )
    expect(updated.find(c => c.id === 1)?.columnId).toBe('doing')
    expect(updated.filter(c => c.columnId === 'todo')).toHaveLength(1)
    expect(updated.filter(c => c.columnId === 'doing')).toHaveLength(2)
  })

  it('preserves other cards on move', () => {
    const updated = cards.map(card =>
      card.id === 1 ? { ...card, columnId: 'done' } : card
    )
    const otherCards = updated.filter(c => c.id !== 1)
    expect(otherCards).toEqual(cards.filter(c => c.id !== 1))
  })

  it('handles empty column', () => {
    const emptyCards: typeof cards = []
    const grouped = columns.map(col => ({
      ...col,
      cards: emptyCards.filter(c => c.columnId === col.id),
    }))
    expect(grouped.every(g => g.cards.length === 0)).toBe(true)
  })
})
