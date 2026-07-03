/**
 * Article 管理页
 * 路由: /admin/articles
 *
 * 使用 DslTable + DslForm 动态渲染
 */
import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Modal, App } from 'antd'
import AdminLayout from '../../../layouts/AdminLayout'
import { DslTable, DslForm } from '../../../modules/dsl'
import type { DslMeta } from '../../../types/dsl'
import type { ReactNode } from 'react'

interface ArticleIndexProps {
  meta: DslMeta
  articles: Record<string, any>[]
  categories: { id: number; name: string }[]
}

function ArticleIndex({ meta, articles, categories }: ArticleIndexProps) {
  const { message } = App.useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Record<string, any> | null>(null)

  const openCreate = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (record: Record<string, any>) => {
    setEditing(record)
    setModalOpen(true)
  }

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

  return (
    <>
      <DslTable
        meta={meta}
        data={articles}
        basePath="/admin/articles"
        createText="新建文章"
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
