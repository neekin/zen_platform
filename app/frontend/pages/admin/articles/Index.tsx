/**
 * Article 管理页
 * 路由: /admin/articles
 *
 * 包含：列表 + 新增/编辑浮层表单 + 详情抽屉
 */
import { useState } from 'react'
import { router } from '@inertiajs/react'
import { PageContainer, ProTable, ProForm, ProFormText, ProFormSelect, DrawerForm } from '@ant-design/pro-components'
import { App, Button, Space, Popconfirm, Modal, Descriptions } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import AdminLayout from '../../../layouts/AdminLayout'

import { RichTextEditor, RichTextViewer, ActiveStorageUploader, getContentSummary } from '../../../modules/content'
import type { EditorContent } from '../../../modules/content'

import type { ReactNode } from 'react'
import type { ProColumns } from '@ant-design/pro-components'

interface Article {
  id: number
  title: string
  body: string
  category_id: string

  category?: { id: number; name: string }

  created_at: string
  updated_at: string
}


// 创建上传器
const uploader = new ActiveStorageUploader({
  accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: 10 * 1024 * 1024,
})



interface ArticleIndexProps {
  articles: Article[]

  categories: { id: number; name: string }[]


}

function ArticleIndex({ articles, ...props }: ArticleIndexProps) {
  const { message } = App.useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Article | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [viewing, setViewing] = useState<Article | null>(null)

  const [bodyContent, setBodyContent] = useState<EditorContent>('{}')


  const openCreate = () => {
    setEditing(null)

    setBodyContent('{}')

    setModalOpen(true)
  }

  const openEdit = (record: Article) => {
    setEditing(record)

    setBodyContent(record.body || '{}')

    setModalOpen(true)
  }

  const openView = (record: Article) => {
    setViewing(record)
    setDrawerOpen(true)
  }

  const handleDelete = (id: number) => {
    router.delete(`/admin/articles/${id}`, {
      onSuccess: () => message.success('删除成功'),
    })
  }

  const handleFinish = async (values: Record<string, any>) => {
    const data = {
      ...values,

      body: bodyContent,

    }

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

  // 列定义
  const columns: ProColumns<Article>[] = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },


    { title: 'title', dataIndex: 'title', key: 'title' },



    {
      title: 'category',
      dataIndex: ['category', 'name'],
      key: 'category_id',
    },



    {
      title: 'body',
      dataIndex: 'body',
      key: 'body',
      width: 200,
      ellipsis: true,
      render: (_: any, record: Article) => {
        const text = getContentSummary(record.body, 100)
        return text || <span style={{ color: 'var(--ant-color-text-tertiary)' }}>-</span>
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
    <PageContainer title="文章管理">
      <ProTable
        columns={columns}
        dataSource={articles}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建文章</Button>,
        ]}
      />

      {/* 新增/编辑浮层表单 */}
      <Modal
        title={editing ? '编辑文章' : '新建文章'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={800}
      >
        <ProForm
          initialValues={editing || {}}
          onFinish={handleFinish}
          submitter={{
            searchConfig: { submitText: editing ? '更新' : '创建' },
            resetButtonProps: { onClick: () => setModalOpen(false) },
          }}
        >


          <ProFormText name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]} />



          <ProFormSelect
            name="category_id"
            label="分类"
            options={(props.categories || []).map((item: any) => ({
              label: item.name,
              value: item.id,
            }))}
            showSearch
            filterOption={(input: string, option: any) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
            rules={[{ required: true, message: '请选择category' }]}
          />



          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>body</div>
            <RichTextEditor
              value={bodyContent}
              onChange={setBodyContent}
              toolbar={['bold', 'italic', 'underline', 'heading', 'quote', 'bullet-list', 'numbered-list', 'link', 'image']}
              uploader={uploader}
              placeholder="请输入body..."
            />
          </div>

        </ProForm>
      </Modal>

      {/* 详情抽屉 */}
      <DrawerForm
        title="Article详情"
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        submitter={false}
      >
        {viewing && (
          <>
            <Descriptions bordered column={1}>


              <Descriptions.Item label="title">{viewing.title}</Descriptions.Item>



              <Descriptions.Item label="category">
                {viewing.category?.name || '-'}
              </Descriptions.Item>


              <Descriptions.Item label="创建时间">{viewing.created_at}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{viewing.updated_at}</Descriptions.Item>
            </Descriptions>


            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>body</div>
              {viewing.body && viewing.body !== '{}' ? (
                <RichTextViewer content={viewing.body} />
              ) : (
                <span style={{ color: 'var(--ant-color-text-tertiary)' }}>暂无内容</span>
              )}
            </div>



          </>
        )}
      </DrawerForm>
    </PageContainer>
  )
}

ArticleIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default ArticleIndex
