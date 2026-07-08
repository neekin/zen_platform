import React from 'react'
import { usePage, router } from '@inertiajs/react'
import { Tag, Button, Typography } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import AdminLayout from '@/layouts/AdminLayout'
import CRUDDataTable from '@/components/admin/CRUDDataTable'
import type { ReactNode } from 'react'

interface NotificationItem {
  id: number
  action: string
  read: boolean
  actor?: { id: number; name: string }
  notifiable_type?: string
  notifiable_id?: number
  metadata?: string
  created_at: string
}

type Props = {
  notifications: NotificationItem[]
  unread_count: number
}

const actionLabels: Record<string, string> = {
  created: '创建了',
  updated: '更新了',
  published: '发布了',
  commented: '评论了',
  assigned: '分配了',
}

export default function NotificationsIndex() {
  const { notifications, unread_count } = usePage<{ props: Props }>().props as unknown as Props

  const handleMarkAsRead = async (id: number) => {
    await fetch(`/admin/notifications/${id}/mark_as_read`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
      },
    })
    router.reload()
  }

  const handleMarkAllAsRead = async () => {
    await fetch('/admin/notifications/mark_all_as_read', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
      },
    })
    router.reload()
  }

  const columns = [
    {
      title: '状态',
      dataIndex: 'read',
      key: 'read',
      width: 80,
      render: (_: any, record: NotificationItem) => (
        <Tag color={record.read ? 'default' : 'blue'}>
          {record.read ? '已读' : '未读'}
        </Tag>
      ),
    },
    {
      title: '内容',
      key: 'content',
      render: (_: any, record: NotificationItem) => (
        <Typography.Text style={{ color: 'rgba(255,255,255,0.85)' }}>
          <Typography.Text strong style={{ color: '#1677FF' }}>
            {record.actor?.name || '系统'}
          </Typography.Text>
          {' '}
          {actionLabels[record.action] || record.action}
          {' '}
          {record.notifiable_type && (
            <Typography.Text type="secondary">
              {record.notifiable_type} #{record.notifiable_id}
            </Typography.Text>
          )}
        </Typography.Text>
      ),
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (_: any, record: NotificationItem) => new Date(record.created_at).toLocaleString('zh-CN'),
    },
  ]

  return (
    <>
      {unread_count > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Button onClick={handleMarkAllAsRead}>
            全部标为已读 ({unread_count})
          </Button>
        </div>
      )}

      <CRUDDataTable<NotificationItem>
        headerTitle="通知中心"
        rowKey="id"
        columns={columns}
        dataSource={notifications}
        pagination={false}
        crudConfig={{
          resource: 'notifications',
          enableCreate: false,
          enableEdit: false,
          enableDelete: false,
          extraActions: (record) => {
            if (record.read) return []
            return [
              {
                key: 'markAsRead',
                label: '标为已读',
                icon: <CheckOutlined />,
                onClick: () => handleMarkAsRead(record.id),
              },
            ]
          },
        }}
      />
    </>
  )
}

NotificationsIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
