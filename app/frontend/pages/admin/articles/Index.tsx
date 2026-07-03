/**
 * Article 管理页
 * 路由: /admin/articles
 *
 * 使用 DslTable + DslForm 动态渲染，支持服务端分页
 */
import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Modal, App } from 'antd'
import AdminLayout from '../../../layouts/AdminLayout'
import { DslTable, DslForm } from '../../../modules/dsl'
import type { DslMeta, PaginationConfig } from '../../../modules/dsl'
import type { ReactNode } from 'react'

interface ArticleIndexProps {
  meta: DslMeta
  articles: Record<string, any>[]
  categories: { id: number; name: string }[]
  pagination: { current_page: number; per_page: number; total: number }
}

function ArticleIndex({ meta, articles, categories, pagination }: ArticleIndexProps) {
  const { message } = App.useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Record<string, any> | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const handleFinish = async (values: Record<string, any>) => {
    if (editing) {
      router.put(`/admin/articles/${editing.id}`, values, {
        onSuccess: () => { message.success('更新成功'); setModalOpen(false) },
      })
    } else {
      router.post('/admin/articles', values, {
        onSuccess: () => { message.success('创建成功'); setModalOpen(false) },
      })
    }
    return true
  }

  const handleBulkDelete = (ids: React.Key[]) => {
    router.delete('/admin/articles/bulk_destroy', {
      data: { ids },
      onSuccess: () => {
        message.success('批量删除成功')
        setSelectedRowKeys([])
      },
    })
  }

  const handleServerChange = (params: { page: number; perPage: number; q?: string }) => {
    const query: Record<string, any> = { page: params.page, per_page: params.perPage }
    if (params.q) query.q = params.q
    router.get('/admin/articles', query, { preserveState: true })
  }

  return (
    <>
      <DslTable
        meta={meta}
        data={articles}
        basePath="/admin/articles"
        createText="新建文章"
        onCreate={() => { setEditing(null); setModalOpen(true) }}
        onEdit={(record) => { setEditing(record); setModalOpen(true) }}
        serverSide
        pagination={{
          current: pagination.current_page,
          pageSize: pagination.per_page,
          total: pagination.total,
        }}
        onServerChange={handleServerChange}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        onBulkDelete={handleBulkDelete}
      />

      <Modal
        title={editing ? '编辑文章' : '新建文章'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={800}
      >
        <DslForm
          meta={meta}
          initialValues={editing || {}}
          onFinish={handleFinish}
          associations={{
            category: categories.map(c => ({ label: c.name, value: c.id })),
          }}
          submitText={editing ? '更新' : '创建'}
        />
      </Modal>
    </>
  )
}

ArticleIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default ArticleIndex
