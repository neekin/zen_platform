import { useState } from 'react'
import { router } from '@inertiajs/react'
import { App, Modal } from 'antd'
import AdminLayout from '@/layouts/AdminLayout'
import { DslTable, DslForm, DslModal } from '@/modules/dsl'
import type { DslMeta } from '@/types/dsl'
import type { ReactNode } from 'react'

interface ArticlesIndexProps {
  meta: DslMeta
  articles: Record<string, any>[]
  categories?: { id: number; name: string }[]
  pagination?: { current_page: number; per_page: number; total: number }
}

function ArticlesIndex({ meta, articles, categories, pagination }: ArticlesIndexProps) {
  const { message } = App.useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Record<string, any> | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const handleFinish = async (values: Record<string, any>) => {
    if (editing) {
      router.put(`/admin/articles/${editing.id}`, values, {
        onSuccess: () => { message.success('更新成功'); setModalOpen(false); router.reload() },
      })
    } else {
      router.post('/admin/articles', values, {
        onSuccess: () => { message.success('创建成功'); setModalOpen(false); router.reload() },
      })
    }
    return true
  }

  const handleBatchAction = async (actionName: string, ids: React.Key[]) => {
    router.post('/admin/articles/batch_action', {
      action_name: actionName,
      ids: ids,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        message.success('批量操作完成')
        setSelectedRowKeys([])
        router.reload()
      },
      onError: () => message.error('操作失败'),
    })
  }

  const handleBulkDelete = (ids: React.Key[]) => {
    router.delete('/admin/articles/bulk_destroy', {
      data: { ids },
      onSuccess: () => {
        message.success('批量删除成功')
        setSelectedRowKeys([])
        router.reload()
      },
    })
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
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        batchActions={meta.batch_actions}
        onBatchAction={handleBatchAction}
        onBulkDelete={handleBulkDelete}
      />

      <DslModal
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
          associations={categories ? { category: categories.map(c => ({ label: c.name, value: c.id })) } : undefined}
          submitText={editing ? '更新' : '创建'}
        />
      </DslModal>
    </>
  )
}

ArticlesIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default ArticlesIndex
