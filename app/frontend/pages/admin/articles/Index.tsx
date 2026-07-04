import { useState } from 'react'
import { router } from '@inertiajs/react'
import { App, Modal } from 'antd'
import AdminLayout from '@/layouts/AdminLayout'
import { DslTable, DslForm } from '@/modules/dsl'
import type { DslMeta } from '@/types/dsl'
import type { ReactNode } from 'react'

interface ArticlesIndexProps {
  meta: DslMeta
  articles: Record<string, any>[]
}

function ArticlesIndex({ meta, articles }: ArticlesIndexProps) {
  const { message } = App.useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Record<string, any> | null>(null)

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

  return (
    <>
      <DslTable
        meta={meta}
        data={articles}
        basePath="/admin/articles"
        createText="新建文章"
        onCreate={() => { setEditing(null); setModalOpen(true) }}
        onEdit={(record) => { setEditing(record); setModalOpen(true) }}
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
          submitText={editing ? '更新' : '创建'}
        />
      </Modal>
    </>
  )
}

ArticlesIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default ArticlesIndex
