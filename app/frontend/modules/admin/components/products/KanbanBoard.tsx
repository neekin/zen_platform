/**
 * 看板组件
 *
 * 支持拖拽排序、分组显示
 */
import { useState, useCallback } from 'react'
import { Card, Tag, Space, Button, Dropdown } from 'antd'
import { PlusOutlined, MoreOutlined } from '@ant-design/icons'

export interface KanbanColumn {
  /** 列 ID */
  id: string
  /** 列标题 */
  title: string
  /** 列颜色 */
  color?: string
  /** 最大卡片数量 */
  maxCount?: number
}

export interface KanbanCard {
  /** 卡片 ID */
  id: string | number
  /** 卡片标题 */
  title: string
  /** 卡片描述 */
  description?: string
  /** 所属列 ID */
  columnId: string
  /** 标签 */
  tags?: { label: string; color: string }[]
  /** 额外数据 */
  [key: string]: any
}

export interface KanbanBoardProps {
  /** 列定义 */
  columns: KanbanColumn[]
  /** 卡片数据 */
  cards: KanbanCard[]
  /** 卡片渲染函数 */
  renderCard?: (card: KanbanCard) => React.ReactNode
  /** 卡片点击回调 */
  onCardClick?: (card: KanbanCard) => void
  /** 卡片拖拽回调 */
  onCardMove?: (cardId: string | number, fromColumn: string, toColumn: string, newIndex: number) => void
  /** 新增卡片回调 */
  onAddCard?: (columnId: string) => void
  /** 编辑卡片回调 */
  onEditCard?: (card: KanbanCard) => void
  /** 删除卡片回调 */
  onDeleteCard?: (card: KanbanCard) => void
  /** 是否禁用拖拽 */
  disableDrag?: boolean
  /** 自定义样式 */
  style?: React.CSSProperties
}

export default function KanbanBoard({
  columns,
  cards,
  renderCard,
  onCardClick,
  onCardMove,
  onAddCard,
  onEditCard,
  onDeleteCard,
  disableDrag = false,
  style,
}: KanbanBoardProps) {
  const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  // 按列分组卡片
  const getCardsByColumn = useCallback(
    (columnId: string) => cards.filter((card) => card.columnId === columnId),
    [cards],
  )

  // 拖拽开始
  const handleDragStart = useCallback(
    (e: React.DragEvent, card: KanbanCard) => {
      if (disableDrag) return
      setDraggedCard(card)
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', card.id.toString())
    },
    [disableDrag],
  )

  // 拖拽经过列
  const handleDragOver = useCallback(
    (e: React.DragEvent, columnId: string) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      setDragOverColumn(columnId)
    },
    [],
  )

  // 拖拽离开列
  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null)
  }, [])

  // 放下卡片
  const handleDrop = useCallback(
    (e: React.DragEvent, columnId: string) => {
      e.preventDefault()
      setDragOverColumn(null)

      if (!draggedCard || draggedCard.columnId === columnId) {
        setDraggedCard(null)
        return
      }

      onCardMove?.(draggedCard.id, draggedCard.columnId, columnId, 0)
      setDraggedCard(null)
    },
    [draggedCard, onCardMove],
  )

  // 拖拽结束
  const handleDragEnd = useCallback(() => {
    setDraggedCard(null)
    setDragOverColumn(null)
  }, [])

  // 默认卡片渲染
  const defaultRenderCard = (card: KanbanCard) => (
    <Card
      size="small"
      style={{
        marginBottom: 8,
        cursor: 'pointer',
        opacity: draggedCard?.id === card.id ? 0.5 : 1,
      }}
      hoverable
      draggable={!disableDrag}
      onDragStart={(e) => handleDragStart(e, card)}
      onDragEnd={handleDragEnd}
      onClick={() => onCardClick?.(card)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{card.title}</div>
          {card.description && (
            <div style={{ fontSize: 12, color: 'var(--ant-color-text-secondary)', marginBottom: 8 }}>
              {card.description.length > 50
                ? card.description.substring(0, 50) + '...'
                : card.description}
            </div>
          )}
          {card.tags && card.tags.length > 0 && (
            <Space size={4} wrap>
              {card.tags.map((tag, index) => (
                <Tag key={index} color={tag.color} style={{ margin: 0 }}>
                  {tag.label}
                </Tag>
              ))}
            </Space>
          )}
        </div>
        {(onEditCard || onDeleteCard) && (
          <Dropdown
            menu={{
              items: [
                onEditCard && { key: 'edit', label: '编辑', onClick: () => onEditCard(card) },
                onDeleteCard && { key: 'delete', label: '删除', danger: true, onClick: () => onDeleteCard(card) },
              ].filter(Boolean) as any,
            }}
            trigger={['click']}
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        )}
      </div>
    </Card>
  )

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        overflowX: 'auto',
        padding: '0 0 16px 0',
        ...style,
      }}
    >
      {columns.map((column) => {
        const columnCards = getCardsByColumn(column.id)
        const isOver = dragOverColumn === column.id
        const isFull = column.maxCount ? columnCards.length >= column.maxCount : false

        return (
          <div
            key={column.id}
            style={{
              flex: '0 0 280px',
              background: isOver ? 'var(--ant-color-primary-bg)' : 'var(--ant-color-bg-secondary)',
              borderRadius: 'var(--ant-border-radius)',
              padding: 12,
              minHeight: 400,
              transition: 'background 0.2s',
            }}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* 列头 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
                padding: '0 4px',
              }}
            >
              <Space size={8}>
                {column.color && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: column.color,
                    }}
                  />
                )}
                <span style={{ fontWeight: 500 }}>{column.title}</span>
                <Tag style={{ margin: 0 }}>{columnCards.length}</Tag>
              </Space>
              {onAddCard && (
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => onAddCard(column.id)}
                  disabled={isFull}
                />
              )}
            </div>

            {/* 卡片列表 */}
            <div style={{ minHeight: 100 }}>
              {columnCards.map((card) =>
                renderCard ? renderCard(card) : defaultRenderCard(card),
              )}
              {columnCards.length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '24px 0',
                    color: 'var(--ant-color-text-tertiary)',
                    fontSize: 12,
                  }}
                >
                  暂无数据
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
