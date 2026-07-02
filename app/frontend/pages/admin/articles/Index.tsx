/**
 * Article 管理页
 * 路由: /admin/articles
 *
 * 包含：列表 + 新增/编辑浮层表单 + 详情抽屉
 */
import { useState } from 'react'
import { router } from '@inertiajs/react'
import { PageContainer, ProTable, ProForm, ProFormText, DrawerForm } from '@ant-design/pro-components'
import { Button, Space, Popconfirm, message, Modal } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import AdminLayout from '../../../layouts/AdminLayout'
import type { ReactNode } from 'react'
import type { ActionType, ProColumns } from '@ant-design/pro-components'

interface Article {
  id: number
  title: string
  body: string
  status: string
  created_at: string
  updated_at: string
}

function ArticleIndex({ articles }: { articles: Article[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Article | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [viewing, setViewing] = useState<Article | null>(null)

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (record: Article) => {
    setEditing(record)
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
    if (editing) {
      router.put(`/admin/articles/${editing.id}`, values, {
        onSuccess: () => {
          message.success('更新成功')
          setModalOpen(false)
        },
      })
    } else {
      router.post('/admin/articles', values, {
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
        destroyOnClose
      >
        <ProForm
          initialValues={editing || {}}
          onFinish={handleFinish}
          submitter={{
            searchConfig: { submitText: editing ? '更新' : '创建' },
            resetButtonProps: { onClick: () => setModalOpen(false) },
          }}
        >

          <ProFormText name="title" label="title" rules={[{ required: true, message: '请输入title' }]} />

          <ProFormText name="body" label="body" rules={[{ required: true, message: '请输入body' }]} />

          <ProFormText name="status" label="status" rules={[{ required: true, message: '请输入status' }]} />

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

            <ProFormText name="title" label="title" initialValue={viewing.title} disabled />

            <ProFormText name="body" label="body" initialValue={viewing.body} disabled />

            <ProFormText name="status" label="status" initialValue={viewing.status} disabled />

          </>
        )}
      </DrawerForm>
    </PageContainer>
  )
}

ArticleIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default ArticleIndex
