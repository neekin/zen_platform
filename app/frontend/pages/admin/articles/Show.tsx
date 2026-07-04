/**
 * Article 详情页
 * 路由: /admin/articles/:id
 */
import { router } from '@inertiajs/react'
import { PageContainer, ProDescriptions } from '@ant-design/pro-components'
import { App, Button, Space, Popconfirm, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import AdminLayout from '../../../layouts/AdminLayout'

import type { ReactNode } from 'react'

interface Article {
  id: number
  title: string
  body: string

  created_at: string
  updated_at: string
}

function ArticleShow({ article }: { article: Article }) {
  const { message } = App.useApp()

  return (
    <PageContainer
      title="Article详情"
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.visit('/admin/articles')}>返回</Button>
          <Button icon={<EditOutlined />} onClick={() => router.visit(`/admin/articles/${article.id}/edit`)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => { router.delete(`/admin/articles/${article.id}`, { onSuccess: () => { message.success('删除成功'); router.visit('/admin/articles') } }) }}>
            <Button danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      }
    >
      <ProDescriptions bordered column={2}>
        <ProDescriptions.Item label="ID">{article.id}</ProDescriptions.Item>


        <ProDescriptions.Item label="title">{article.title}</ProDescriptions.Item>



        <ProDescriptions.Item label="body">{article.body}</ProDescriptions.Item>


        <ProDescriptions.Item label="创建时间">{article.created_at}</ProDescriptions.Item>
        <ProDescriptions.Item label="更新时间">{article.updated_at}</ProDescriptions.Item>
      </ProDescriptions>
    </PageContainer>
  )
}

ArticleShow.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default ArticleShow
