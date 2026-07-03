import { Card, Row, Col, Empty, Typography, Tag } from 'antd'
import { EyeOutlined } from '@ant-design/icons'

const { Text, Paragraph } = Typography

export interface GalleryViewProps {
  data: Record<string, any>[]
  imageField: string
  titleField: string
  descriptionField?: string
  statusField?: string
  onItemClick?: (item: Record<string, any>) => void
  columns?: number
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'default',
  published: 'green',
  archived: 'red',
  active: 'green',
  inactive: 'orange',
}

export default function GalleryView({
  data,
  imageField,
  titleField,
  descriptionField,
  statusField,
  onItemClick,
  columns = 4,
}: GalleryViewProps) {
  if (data.length === 0) {
    return <Empty description="暂无数据" />
  }

  const span = 24 / columns

  return (
    <Row gutter={[16, 16]}>
      {data.map((item, index) => (
        <Col key={item.id || index} span={span}>
          <Card
            hoverable
            onClick={() => onItemClick?.(item)}
            cover={
              item[imageField] ? (
                <div style={{ height: 200, overflow: 'hidden', background: '#f0f0f0' }}>
                  <img
                    alt={item[titleField]}
                    src={item[imageField]}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div style={{
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--ant-color-fill-tertiary)',
                  color: 'var(--ant-color-text-tertiary)',
                }}>
                  <EyeOutlined style={{ fontSize: 32 }} />
                </div>
              )
            }
            actions={onItemClick ? [
              <span key="view" onClick={() => onItemClick(item)}>查看详情</span>,
            ] : undefined}
          >
            <Card.Meta
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text ellipsis style={{ flex: 1 }}>{item[titleField]}</Text>
                  {statusField && item[statusField] && (
                    <Tag color={STATUS_COLORS[item[statusField]] || 'default'} style={{ marginLeft: 8 }}>
                      {item[statusField]}
                    </Tag>
                  )}
                </div>
              }
              description={
                descriptionField && item[descriptionField] ? (
                  <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0, fontSize: 12 }}>
                    {item[descriptionField]}
                  </Paragraph>
                ) : null
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  )
}
