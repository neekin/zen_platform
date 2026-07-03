/**
 * Product 管理页
 * 路由: /admin/products
 *
 * 包含：列表 + 新增/编辑浮层表单 + 详情抽屉
 */
import { useState } from 'react'
import { router } from '@inertiajs/react'
import { PageContainer, ProTable, ProForm, ProFormText, ProFormDigit, ProFormSelect, DrawerForm } from '@ant-design/pro-components'
import { App, Button, Space, Popconfirm, Modal, Descriptions } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import AdminLayout from '../../../layouts/AdminLayout'

import type { ReactNode } from 'react'
import type { ProColumns } from '@ant-design/pro-components'

interface Product {
  id: number
  name: string
  price: string
  created_at: string
  updated_at: string
}



function ProductIndex({ products }: { products: Product[] }) {
  const { message } = App.useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [viewing, setViewing] = useState<Product | null>(null)


  const openCreate = () => {
    setEditing(null)

    setModalOpen(true)
  }

  const openEdit = (record: Product) => {
    setEditing(record)

    setModalOpen(true)
  }

  const openView = (record: Product) => {
    setViewing(record)
    setDrawerOpen(true)
  }

  const handleDelete = (id: number) => {
    router.delete(`/admin/products/${id}`, {
      onSuccess: () => message.success('删除成功'),
    })
  }

  const handleFinish = async (values: Record<string, any>) => {
    const data = {
      ...values,

    }

    if (editing) {
      router.put(`/admin/products/${editing.id}`, data, {
        onSuccess: () => {
          message.success('更新成功')
          setModalOpen(false)
        },
      })
    } else {
      router.post('/admin/products', data, {
        onSuccess: () => {
          message.success('创建成功')
          setModalOpen(false)
        },
      })
    }
    return true
  }

  // 列定义
  const columns: ProColumns<Product>[] = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },


    { title: 'name', dataIndex: 'name', key: 'name' },



    { title: 'price', dataIndex: 'price', key: 'price' },



    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', valueType: 'dateTime' },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Product) => (
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
    <PageContainer title="Product管理">
      <ProTable
        columns={columns}
        dataSource={products}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={openCreate}>新建Product</Button>,
        ]}
      />

      {/* 新增/编辑浮层表单 */}
      <Modal
        title={editing ? '编辑Product' : '新建Product'}
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


          <ProFormText name="name" label="name" rules={[{ required: true, message: '请输入name' }]} />



          <ProFormText name="price" label="price" rules={[{ required: true, message: '请输入price' }]} />



        </ProForm>
      </Modal>

      {/* 详情抽屉 */}
      <DrawerForm
        title="Product详情"
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        submitter={false}
      >
        {viewing && (
          <>


            <ProFormText name="name" label="name" initialValue={viewing.name} disabled />



            <ProFormText name="price" label="price" initialValue={viewing.price} disabled />



          </>
        )}
      </DrawerForm>
    </PageContainer>
  )
}

ProductIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default ProductIndex
