/**
 * Article 详情页
 * 路由: /admin/articles/:id
 */
import { router } from '@inertiajs/react'
import { PageContainer } from '@ant-design/pro-components'
import { Card, Descriptions, Button, Space, Popconfirm, message } from 'antd'
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons'
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

function ArticleShow({ article }: { article: Article }) {
  return (
    <PageContainer
      title="Article详情"
      extra={[
        <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => router.visit('/admin/articles')}>返回列表</Button>,
        <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => router.visit(`/admin/articles/${article.id}/edit`)}>编辑</Button>,
        <Popconfirm key="delete" title="确定删除？" onConfirm={() => { router.delete(`/admin/articles/${article.id}`, { onSuccess: () => { message.success('删除成功'); router.visit('/admin/articles') } }) }}>
          <Button danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>,
      ]}
    >
      <Card>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="ID">{article.id}</Descriptions.Item>

          <Descriptions.Item label="title">{article.title}</Descriptions.Item>

          <Descriptions.Item label="body">{article.body}</Descriptions.Item>

          <Descriptions.Item label="status">{article.status}</Descriptions.Item>

          <Descriptions.Item label="创建时间">{article.created_at}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{article.updated_at}</Descriptions.Item>
        </Descriptions>
      </Card>
    </PageContainer>
  )
}

ArticleShow.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default ArticleShow
