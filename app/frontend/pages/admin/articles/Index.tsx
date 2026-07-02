/**
 * Article 列表页
 * 路由: /admin/articles
 *
 * Props (从控制器传入):
 * - articles: Article[] - Article 列表数据
 */
import { router } from '@inertiajs/react'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import { Button, Space, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import AdminLayout from '../../../layouts/AdminLayout'
import type { ReactNode } from 'react'

interface Article {
  id: number
  title: string
  body: string
  status: string
  created_at: string
  updated_at: string
}

function ArticleIndex({ articles }: { articles: Article[] }) {
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'title', dataIndex: 'title', key: 'title' },
    { title: 'body', dataIndex: 'body', key: 'body' },
    { title: 'status', dataIndex: 'status', key: 'status' },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', valueType: 'dateTime' },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Article) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => router.visit(`/admin/articles/${record.id}`)}>查看</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => router.visit(`/admin/articles/${record.id}/edit`)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => router.delete(`/admin/articles/${record.id}`, { onSuccess: () => message.success('删除成功') })}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <PageContainer title="Article管理">
      <ProTable
        columns={columns}
        dataSource={articles}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => router.visit('/admin/articles/new')}>新建Article</Button>,
        ]}
      />
    </PageContainer>
  )
}

ArticleIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default ArticleIndex
