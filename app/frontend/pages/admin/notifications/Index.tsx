import React from 'react'
import { usePage, router } from '@inertiajs/react'
import { ProTable, type ProColumns } from '@ant-design/pro-components'
import { Tag, Button, Space, Typography } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import AdminLayout from '@/layouts/AdminLayout'
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

interface Props {
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

  const columns: ProColumns<NotificationItem>[] = [
    {
      title: '状态',
      dataIndex: 'read',
      key: 'read',
      width: 80,
      render: (_, record) => (
        <Tag color={record.read ? 'default' : 'blue'}>
          {record.read ? '已读' : '未读'}
        </Tag>
      ),
    },
    {
      title: '内容',
      key: 'content',
      render: (_, record) => (
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
      render: (_, record) => new Date(record.created_at).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => !record.read ? (
        <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => handleMarkAsRead(record.id)}>
          标为已读
        </Button>
      ) : null,
    },
  ]

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        {unread_count > 0 && (
          <Button onClick={handleMarkAllAsRead}>
            全部标为已读 ({unread_count})
          </Button>
        )}
      </Space>

      <ProTable<NotificationItem>
        headerTitle="通知中心"
        rowKey="id"
        columns={columns}
        dataSource={notifications}
        search={false}
        pagination={{ pageSize: 20 }}
        options={{ density: true, fullScreen: true, reload: false }}
        rowClassName={(record) => record.read ? '' : 'unread-row'}
      />
    </>
  )
}

NotificationsIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
