import { Calendar, Badge, Card, List } from 'antd'
import { useState } from 'react'
import type { Dayjs } from 'dayjs'

export interface CalendarViewProps {
  data: Record<string, any>[]
  dateField: string
  titleField: string
  colorField?: string
  onSelect?: (date: Date) => void
  onItemClick?: (item: Record<string, any>) => void
}

const DEFAULT_COLORS: Record<string, string> = {
  draft: 'default',
  published: 'green',
  archived: 'red',
  active: 'green',
  inactive: 'orange',
  todo: 'blue',
  doing: 'processing',
  done: 'success',
}

export default function CalendarView({
  data,
  dateField,
  titleField,
  colorField,
  onSelect,
  onItemClick,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)

  const getListData = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD')
    return data.filter((item) => {
      const itemDate = item[dateField]
      if (!itemDate) return false
      return itemDate.startsWith(dateStr)
    })
  }

  const dateCellRender = (date: Dayjs) => {
    const items = getListData(date)
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.slice(0, 3).map((item, index) => {
          const color = colorField ? (DEFAULT_COLORS[item[colorField]] || 'default') : 'blue'
          return (
            <li key={index}>
              <Badge
                color={color}
                text={
                  <span
                    style={{ cursor: onItemClick ? 'pointer' : 'default', fontSize: 12 }}
                    onClick={() => onItemClick?.(item)}
                  >
                    {item[titleField]}
                  </span>
                }
              />
            </li>
          )
        })}
        {items.length > 3 && (
          <li style={{ fontSize: 11, color: 'var(--ant-color-text-tertiary)' }}>
            +{items.length - 3} 更多
          </li>
        )}
      </ul>
    )
  }

  const handleSelect = (date: Dayjs) => {
    setSelectedDate(date)
    onSelect?.(date.toDate())
  }

  const selectedItems = selectedDate ? getListData(selectedDate) : []

  return (
    <div>
      <Calendar cellRender={(date, info) => info.type === 'date' ? dateCellRender(date) : null} onSelect={handleSelect} />

      {selectedDate && selectedItems.length > 0 && (
        <Card
          title={`${selectedDate.format('YYYY-MM-DD')} 的事件 (${selectedItems.length})`}
          style={{ marginTop: 16 }}
          size="small"
        >
          <List
            size="small"
            dataSource={selectedItems}
            renderItem={(item) => (
              <List.Item
                style={{ cursor: onItemClick ? 'pointer' : 'default' }}
                onClick={() => onItemClick?.(item)}
              >
                <List.Item.Meta
                  title={item[titleField]}
                  description={item[dateField]}
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  )
}
