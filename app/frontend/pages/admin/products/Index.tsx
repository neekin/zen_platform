/**
 * Product 管理页
 * 路由: /admin/products
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

interface ProductIndexProps {
  meta: DslMeta
  products: Record<string, any>[]
}

function ProductIndex({ meta, products }: ProductIndexProps) {
  const { message } = App.useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Record<string, any> | null>(null)

  const handleFinish = async (values: Record<string, any>) => {
    if (editing) {
      router.put(`/admin/products/${editing.id}`, values, {
        onSuccess: () => { message.success('更新成功'); setModalOpen(false) },
      })
    } else {
      router.post('/admin/products', values, {
        onSuccess: () => { message.success('创建成功'); setModalOpen(false) },
      })
    }
    return true
  }

  return (
    <>
      <DslTable
        meta={meta}
        data={products}
        basePath="/admin/products"
        createText="新建商品"
        onCreate={() => { setEditing(null); setModalOpen(true) }}
        onEdit={(record) => { setEditing(record); setModalOpen(true) }}
      />

      <Modal
        title={editing ? '编辑商品' : '新建商品'}
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

ProductIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default ProductIndex
