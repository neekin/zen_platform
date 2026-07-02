/**
 * Article 管理页
 * 路由: /admin/articles
 *
 * 集成 Content Engine 富文本编辑器
 */
import { useState } from 'react'
import { router } from '@inertiajs/react'
import { PageContainer, ProTable, ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-components'
import { Button, Space, Popconfirm, message, Modal, Card } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import AdminLayout from '../../../layouts/AdminLayout'
import { RichTextEditor, RichTextViewer, ActiveStorageUploader } from '../../../modules/content'
import type { ReactNode } from 'react'
import type { ProColumns } from '@ant-design/pro-components'
import type { EditorContent } from '../../../modules/content'

interface Article {
  id: number
  title: string
  body: string
  status: string
  created_at: string
  updated_at: string
}

// 创建上传器
const uploader = new ActiveStorageUploader({
  accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: 10 * 1024 * 1024,
})

function ArticleIndex({ articles }: { articles: Article[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Article | null>(null)
  const [viewing, setViewing] = useState<Article | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [bodyContent, setBodyContent] = useState<EditorContent>('{}')

  // 打开新建弹窗
  const openCreate = () => {
    setEditing(null)
    setBodyContent('{}')
    setModalOpen(true)
  }

  // 打开编辑弹窗
  const openEdit = (record: Article) => {
    setEditing(record)
    setBodyContent(record.body || '{}')
    setModalOpen(true)
  }

  // 打开查看详情
  const openView = (record: Article) => {
    setViewing(record)
    setDrawerOpen(true)
  }

  // 删除文章
  const handleDelete = (id: number) => {
    router.delete(`/admin/articles/${id}`, {
      onSuccess: () => message.success('删除成功'),
    })
  }

  // 提交表单
  const handleFinish = async (values: Record<string, any>) => {
    const data = { ...values, body: bodyContent }

    if (editing) {
      router.put(`/admin/articles/${editing.id}`, data, {
        onSuccess: () => {
          message.success('更新成功')
          setModalOpen(false)
        },
      })
    } else {
      router.post('/admin/articles', data, {
        onSuccess: () => {
          message.success('创建成功')
          setModalOpen(false)
        },
      })
    }
    return true
  }

  const columns: ProColumns<Article>[] = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '标题', dataIndex: 'title', key: 'title' },
    {
      title: '内容预览',
      dataIndex: 'body',
      key: 'body',
      width: 300,
      render: (_: any, record: Article) => (
        <div style={{ maxHeight: 60, overflow: 'hidden' }}>
          {record.body && record.body !== '{}' ? (
            <RichTextViewer content={record.body} />
          ) : (
            <span style={{ color: '#999' }}>-</span>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      valueEnum: {
        draft: { text: '草稿', status: 'Default' },
        published: { text: '已发布', status: 'Success' },
      },
    },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', valueType: 'dateTime' },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Article) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => openView(record)}>查看</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
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
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建Article</Button>,
        ]}
      />

      {/* 新增/编辑浮层表单 */}
      <Modal
        title={editing ? '编辑Article' : '新建Article'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <ProForm
          initialValues={editing || { status: 'draft' }}
          onFinish={handleFinish}
          submitter={{
            searchConfig: { submitText: editing ? '更新' : '创建' },
            resetButtonProps: { onClick: () => setModalOpen(false) },
          }}
        >
          <ProFormText name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]} />
          <ProFormSelect
            name="status"
            label="状态"
            options={[
              { label: '草稿', value: 'draft' },
              { label: '已发布', value: 'published' },
            ]}
            rules={[{ required: true, message: '请选择状态' }]}
          />

          {/* 富文本编辑器 */}
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>内容</div>
            <RichTextEditor
              value={bodyContent}
              onChange={setBodyContent}
              toolbar={['bold', 'italic', 'underline', 'heading', 'quote', 'bullet-list', 'numbered-list', 'link', 'image']}
              uploader={uploader}
              placeholder="请输入文章内容..."
            />
          </div>
        </ProForm>
      </Modal>

      {/* 详情查看 */}
      <Modal
        title="Article详情"
        open={drawerOpen}
        onCancel={() => setDrawerOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDrawerOpen(false)}>关闭</Button>,
          <Button key="edit" type="primary" onClick={() => { setDrawerOpen(false); viewing && openEdit(viewing) }}>编辑</Button>,
        ]}
        width={800}
      >
        {viewing && (
          <div>
            <h2>{viewing.title}</h2>
            <div style={{ marginBottom: 16, color: '#666' }}>
              状态：{viewing.status === 'published' ? '已发布' : '草稿'}
            </div>
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              {viewing.body && viewing.body !== '{}' ? (
                <RichTextViewer content={viewing.body} />
              ) : (
                <span style={{ color: '#999' }}>暂无内容</span>
              )}
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  )
}

ArticleIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default ArticleIndex
