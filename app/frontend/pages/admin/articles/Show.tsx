import { router } from '@inertiajs/react'
import { PageContainer, ProDescriptions } from '@ant-design/pro-components'
import { Button, Space, Tag, Popconfirm, App } from 'antd'
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import AdminLayout from '../../../layouts/AdminLayout'
import { RichTextViewer } from '../../../modules/content'
import type { ReactNode } from 'react'

interface Article {
  id: number
  title: string
  body: string
  status: string
  category?: string
  published_at?: string
  comments?: Array<{ id: number; author_name: string; content: string }>
  created_at: string
  updated_at: string
}

interface ArticleShowProps {
  article: Article
}

const statusColors: Record<string, string> = {
  draft: 'default',
  published: 'green',
  archived: 'red',
}

export default function ArticleShow({ article }: ArticleShowProps) {
  const { message } = App.useApp()

  const handleDelete = () => {
    router.delete(`/admin/articles/${article.id}`, {
      onSuccess: () => { message.success('删除成功'); router.visit('/admin/articles') },
    })
  }

  return (
    <PageContainer
      title={article.title}
      subTitle={article.category}
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.visit('/admin/articles')}>返回</Button>
          <Button icon={<EditOutlined />} onClick={() => router.visit(`/admin/articles/${article.id}/edit`)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={handleDelete}>
            <Button danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      }
    >
      <ProDescriptions column={2} bordered>
        <ProDescriptions.Item label="标题" span={2}>{article.title}</ProDescriptions.Item>
        <ProDescriptions.Item label="状态">
          <Tag color={statusColors[article.status] || 'default'}>{article.status}</Tag>
        </ProDescriptions.Item>
        <ProDescriptions.Item label="分类">{article.category || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="发布时间">{article.published_at || '-'}</ProDescriptions.Item>
        <ProDescriptions.Item label="创建时间">{new Date(article.created_at).toLocaleString('zh-CN')}</ProDescriptions.Item>
        <ProDescriptions.Item label="内容" span={2}>
          {article.body && article.body !== '{}' ? (
            <RichTextViewer content={article.body} />
          ) : (
            <span style={{ color: 'var(--ant-color-text-tertiary)' }}>暂无内容</span>
          )}
        </ProDescriptions.Item>
      </ProDescriptions>

      {article.comments && article.comments.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3>评论 ({article.comments.length})</h3>
          {article.comments.map((c) => (
            <div key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--ant-color-border-secondary)' }}>
              <strong>{c.author_name}</strong>: {c.content}
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  )
}

ArticleShow.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
