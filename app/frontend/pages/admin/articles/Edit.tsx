/**
 * Article 编辑页
 * 路由: /admin/articles/:id/edit
 *
 * Props (从控制器传入):
 * - article: Article - 当前编辑的 Article 数据
 * - errors?: string[] - 错误信息列表（表单验证失败时）
 *
 * 功能:
 * - 显示编辑表单（使用 ProForm 组件）
 * - 表单初始值从 props 中加载
 * - 提交表单更新记录
 * - 成功后跳转到详情页
 */
import { router, useForm } from '@inertiajs/react'
import { PageContainer, ProForm, ProFormText } from '@ant-design/pro-components'
import { Card, Button, Space, message } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import AdminLayout from '../../../layouts/AdminLayout'
import type { ReactNode } from 'react'

// Article 数据类型定义
interface Article {
  id: number
  title: string
  body: string
  status: string
  created_at: string
  updated_at: string
}

// 设置页面布局
Articles.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>

export default function EditArticle({ article, errors }: { article: Article; errors?: string[] }) {
  // 表单状态管理，初始值从 props 中加载
  const { data, setData, put, processing } = useForm({

    title: article.title,
    body: article.body,
    status: article.status,
  })

  // 表单提交处理
  const handleSubmit = () => {
    put(`/admin/articles/${article.id}`, {
      onSuccess: () => message.success('更新成功'),
    })
  }

  return (
    <PageContainer
      title="编辑Article"
      extra={[
        // 返回列表按钮
        <Button
          key="back"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.visit('/admin/articles')}
        >
          返回列表
        </Button>,
      ]}
    >
      <Card>
        {/* 错误提示区域 */}
        {errors && errors.length > 0 && (
          <div style={{ marginBottom: 16, color: '#ff4d4f' }}>
            {errors.map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </div>
        )}

        {/* 表单区域 */}
        {/* TODO: 根据需求调整表单项类型（如 Select、DatePicker 等） */}
        <ProForm
          onFinish={handleSubmit}
          submitter={{
            submitButtonProps: { loading: processing },
            submitterRender: (_, dom) => (
              <Space>
                <Button onClick={() => router.visit('/admin/articles')}>取消</Button>
                {dom}
              </Space>
            ),
          }}
        >

          <ProFormText
            name="title"
            label="title"
            value={data.title}
            onChange={(e) => setData('title', e.target.value)}
            rules={[{ required: true, message: '请输入title' }]}
          />

          <ProFormText
            name="body"
            label="body"
            value={data.body}
            onChange={(e) => setData('body', e.target.value)}
            rules={[{ required: true, message: '请输入body' }]}
          />

          <ProFormText
            name="status"
            label="status"
            value={data.status}
            onChange={(e) => setData('status', e.target.value)}
            rules={[{ required: true, message: '请输入status' }]}
          />

        </ProForm>
      </Card>
    </PageContainer>
  )
}
