/**
 * Article 详情页
 * 路由: /admin/articles/:id
 */
import { router } from '@inertiajs/react'
import { PageContainer } from '@ant-design/pro-components'
import { App, Button, Space, Popconfirm, Tag, Card, Descriptions, Row, Col, Statistic } from 'antd'
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined, ClockCircleOutlined } from '@ant-design/icons'
import AdminLayout from '@/layouts/AdminLayout'

import { RichTextViewer } from '@/modules/content'

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
      title={article.id || 'Article详情'}
      subTitle={<Tag color="blue">ID: {article.id}</Tag>}
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.visit('/admin/articles')}>返回列表</Button>
          <Button type="primary" icon={<EditOutlined />} onClick={() => router.visit(`/admin/articles/${article.id}/edit`)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => { router.delete(`/admin/articles/${article.id}`, { onSuccess: () => { message.success('删除成功'); router.visit('/admin/articles') } }) }}>
            <Button danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        {/* 基本信息卡片 */}
        <Col span={24}>
          <Card title="基本信息" variant="borderless">
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="middle">


              <Descriptions.Item label="title">{article.title}</Descriptions.Item>





            </Descriptions>
          </Card>
        </Col>


        {/* body 富文本内容 */}
        <Col span={24}>
          <Card title="body" variant="borderless">
            {article.body && article.body !== '{}' ? (
              <RichTextViewer content={article.body} />
            ) : (
              <span style={{ color: '#999', fontStyle: 'italic' }}>暂无内容</span>
            )}
          </Card>
        </Col>


        {/* 时间信息 */}
        <Col span={24}>
          <Card variant="borderless" size="small">
            <Space split={<span style={{ color: '#ddd' }}>|</span>}>
              <Space>
                <ClockCircleOutlined style={{ color: '#999' }} />
                <span style={{ color: '#666' }}>创建于 {article.created_at}</span>
              </Space>
              <Space>
                <ClockCircleOutlined style={{ color: '#999' }} />
                <span style={{ color: '#666' }}>更新于 {article.updated_at}</span>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  )
}

ArticleShow.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default ArticleShow
