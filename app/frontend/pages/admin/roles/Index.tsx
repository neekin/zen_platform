import { useState } from 'react'
import { router } from '@inertiajs/react'
import { ProTable, ProForm, ProFormText, type ProColumns } from '@ant-design/pro-components'
import { App, Button, Space, Tag, Modal } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import AdminLayout from '../../../layouts/AdminLayout'
import DslModal from '../../../modules/dsl/DslModal'
import type { ReactNode } from 'react'

interface RoleRecord {
  id: number
  name: string
  users_count: number
}

interface RolesIndexProps {
  roles: RoleRecord[]
}

function RolesIndex({ roles }: RolesIndexProps) {
  const { message } = App.useApp()
  const [modalOpen, setModalOpen] = useState(false)

  const builtInRoles = ['super_admin', 'admin', 'editor', 'viewer']

  const handleDelete = (record: RoleRecord) => {
    if (builtInRoles.includes(record.name)) {
      message.warning('内置角色不能删除')
      return
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定删除角色 "${record.name}"？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        router.delete(`/admin/roles/${record.id}`, {
          onSuccess: () => { message.success('删除成功'); router.reload() },
          onError: (errors: any) => message.error(errors.message || '删除失败'),
        })
      },
    })
  }

  const columns: ProColumns<RoleRecord>[] = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Tag color={builtInRoles.includes(record.name) ? 'blue' : 'default'}>{record.name}</Tag>
          {builtInRoles.includes(record.name) && <Tag color="gold">内置</Tag>}
        </Space>
      ),
    },
    { title: '用户数', dataIndex: 'users_count', key: 'users_count', width: 100 },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          danger
          icon={<DeleteOutlined />}
          disabled={builtInRoles.includes(record.name)}
          onClick={() => handleDelete(record)}
        >
          删除
        </Button>
      ),
    },
  ]

  return (
    <>
      <ProTable<RoleRecord>
        headerTitle="角色管理"
        rowKey="id"
        columns={columns}
        dataSource={roles}
        search={false}
        pagination={false}
        options={{ density: true, fullScreen: true, reload: false }}
        toolBarRender={() => [
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            新建角色
          </Button>,
        ]}
      />

      <DslModal
        title="新建角色"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={400}
      >
        <ProForm
          onFinish={async (values) => {
            router.post('/admin/roles', values, {
              onSuccess: () => {
                message.success('创建成功')
                setModalOpen(false)
                router.reload()
              },
              onError: (errors: any) => message.error(errors.message || '创建失败'),
            })
            return true
          }}
          submitter={{
            searchConfig: { submitText: '创建' },
            resetButtonProps: { style: { display: 'none' } },
          }}
        >
          <ProFormText name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]} />
        </ProForm>
      </DslModal>
    </>
  )
}

RolesIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default RolesIndex
