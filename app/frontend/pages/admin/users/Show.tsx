/**
 * User 详情页
 * 路由: /admin/users/:id
 */
import { router } from '@inertiajs/react'
import { PageContainer, ProDescriptions } from '@ant-design/pro-components'
import { App, Button, Space, Popconfirm, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import AdminLayout from '@/layouts/AdminLayout'

import type { ReactNode } from 'react'

interface User {
  id: number


  created_at: string
  updated_at: string
}

function UserShow({ user }: { user: User }) {
  const { message } = App.useApp()

  return (
    <PageContainer
      title="User详情"
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.visit('/admin/users')}>返回</Button>
          <Button icon={<EditOutlined />} onClick={() => router.visit(`/admin/users/${user.id}/edit`)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => { router.delete(`/admin/users/${user.id}`, { onSuccess: () => { message.success('删除成功'); router.visit('/admin/users') } }) }}>
            <Button danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      }
    >
      <ProDescriptions bordered column={2}>
        <ProDescriptions.Item label="ID">{user.id}</ProDescriptions.Item>

        <ProDescriptions.Item label="创建时间">{user.created_at}</ProDescriptions.Item>
        <ProDescriptions.Item label="更新时间">{user.updated_at}</ProDescriptions.Item>
      </ProDescriptions>
    </PageContainer>
  )
}

UserShow.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default UserShow
