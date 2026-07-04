import { useState } from 'react'
import { router } from '@inertiajs/react'
import { App, Modal } from 'antd'
import AdminLayout from '@/layouts/AdminLayout'
import { DslTable, DslForm } from '@/modules/dsl'
import type { DslMeta } from '@/types/dsl'
import type { ReactNode } from 'react'

interface CommentsIndexProps {
  meta: DslMeta
  comments: Record<string, any>[]
}

function CommentsIndex({ meta, comments }: CommentsIndexProps) {
  const { message } = App.useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Record<string, any> | null>(null)

  const handleFinish = async (values: Record<string, any>) => {
    if (editing) {
      router.put(`/admin/comments/${editing.id}`, values, {
        onSuccess: () => { message.success('更新成功'); setModalOpen(false); router.reload() },
      })
    } else {
      router.post('/admin/comments', values, {
        onSuccess: () => { message.success('创建成功'); setModalOpen(false); router.reload() },
      })
    }
    return true
  }

  return (
    <>
      <DslTable
        meta={meta}
        data={comments}
        basePath="/admin/comments"
        createText="新建评论"
        onCreate={() => { setEditing(null); setModalOpen(true) }}
        onEdit={(record) => { setEditing(record); setModalOpen(true) }}
      />

      <Modal
        title={editing ? '编辑评论' : '新建评论'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={600}
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

CommentsIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default CommentsIndex
