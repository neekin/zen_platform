/**
 * Article 新建页
 * 路由: /admin/articles/new
 */
import { router, useForm } from '@inertiajs/react'
import { PageContainer, ProForm, ProFormText } from '@ant-design/pro-components'
import { Card, Button, Space, message } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import AdminLayout from '../../../layouts/AdminLayout'
import type { ReactNode } from 'react'

function ArticleNew({ errors }: { errors?: string[] }) {
  const { data, setData, post, processing } = useForm({
    title: '',
    body: '',
    status: '',
  })

  const handleSubmit = () => {
    post('/admin/articles', { onSuccess: () => message.success('创建成功') })
  }

  return (
    <PageContainer
      title="新建Article"
      extra={[
        <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => router.visit('/admin/articles')}>返回列表</Button>,
      ]}
    >
      <Card>
        {errors && errors.length > 0 && (
          <div style={{ marginBottom: 16, color: '#ff4d4f' }}>
            {errors.map((err, i) => <div key={i}>{err}</div>)}
          </div>
        )}
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

          <ProFormText name="title" label="title" rules={[{ required: true, message: '请输入title' }]} />

          <ProFormText name="body" label="body" rules={[{ required: true, message: '请输入body' }]} />

          <ProFormText name="status" label="status" rules={[{ required: true, message: '请输入status' }]} />

        </ProForm>
      </Card>
    </PageContainer>
  )
}

ArticleNew.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default ArticleNew
