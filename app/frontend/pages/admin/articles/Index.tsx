/**
 * Article 管理页
 * 路由: /admin/articles
 *
 * 由 Zen 脚手架生成 — 使用 DslTable + DslForm 动态渲染
 */
import { useState } from 'react'
import { router } from '@inertiajs/react'
import { App } from 'antd'
import AdminLayout from '../../../layouts/AdminLayout'
import { DslTable, DslForm, DslModal } from '../../../modules/dsl'
import type { DslMeta } from '../../../types/dsl'
import type { ReactNode } from 'react'

interface ArticleIndexProps {
  meta: DslMeta
  articles: Record<string, any>[]

}

function ArticleIndex({ meta, articles, ...props }: ArticleIndexProps) {
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

  // 关联数据源
  const associations: Record<string, Array<{ label: string; value: any }>> = {}


  return (
    <>
      <DslTable
        meta={meta}
        data={articles}
        basePath="/admin/articles"
        createText="新建Article"
      />

      <DslModal
        title={editing ? '编辑Article' : '新建Article'}
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
          associations={associations}
          submitText={editing ? '更新' : '创建'}
        />
      </DslModal>
    </>
  )
}

ArticleIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default ArticleIndex
