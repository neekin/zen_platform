import React from 'react'
import { router } from '@inertiajs/react'
import { Badge, Dropdown, List, Button, Typography, Space, Empty } from 'antd'
import { BellOutlined, CheckOutlined } from '@ant-design/icons'
import { useNotifications } from '@/hooks/useNotifications'

const { Text } = Typography

const actionLabels: Record<string, string> = {
  created: '创建了',
  updated: '更新了',
  published: '发布了',
  commented: '评论了',
  assigned: '分配了',
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()

  const dropdownContent = (
    <div style={{ width: 360, maxHeight: 400, overflow: 'auto', background: '#141b2d', borderRadius: 8, border: '1px solid rgba(100,140,200,0.15)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(100,140,200,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong style={{ color: 'rgba(255,255,255,0.85)' }}>通知</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" icon={<CheckOutlined />} onClick={markAllAsRead}>
            全部已读
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Empty description="暂无通知" style={{ padding: 24 }} />
      ) : (
        <List
          dataSource={notifications.slice(0, 10)}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                background: item.read ? 'transparent' : 'rgba(22,119,255,0.08)',
                borderBottom: '1px solid rgba(100,140,200,0.08)',
              }}
              onClick={() => {
                if (!item.read) markAsRead(item.id)
              }}
            >
              <Space orientation="vertical" size={2} style={{ width: '100%' }}>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                  <Text strong style={{ color: '#1677FF' }}>{item.actor?.name || '系统'}</Text>
                  {' '}
                  {actionLabels[item.action] || item.action}
                  {' '}
                  {item.notifiable_type && (
                    <Text type="secondary">{item.notifiable_type}</Text>
                  )}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {new Date(item.created_at).toLocaleString('zh-CN')}
                </Text>
              </Space>
            </List.Item>
          )}
        />
      )}

      {notifications.length > 0 && (
        <div style={{ padding: '8px 16px', textAlign: 'center', borderTop: '1px solid rgba(100,140,200,0.15)' }}>
          <Button type="link" size="small" onClick={() => router.visit('/admin/notifications')}>
            查看全部
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <Dropdown popupRender={() => dropdownContent} trigger={['click']} placement="bottomRight">
      <Badge count={unreadCount} size="small" offset={[-4, 4]}>
        <BellOutlined style={{ fontSize: 18, cursor: 'pointer', color: 'rgba(255,255,255,0.65)' }} />
      </Badge>
    </Dropdown>
  )
}
