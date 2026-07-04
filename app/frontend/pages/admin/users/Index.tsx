import { useState } from 'react'
import { router } from '@inertiajs/react'
import { ProTable, ProForm, ProFormText, ProFormSelect, type ProColumns } from '@ant-design/pro-components'
import { App, Button, Space, Tag, Modal, Avatar } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons'
import AdminLayout from '@/layouts/AdminLayout'
import DslModal from '@/modules/dsl/DslModal'
import type { ReactNode } from 'react'

interface UserRecord {
  id: number
  email: string
  username: string
  name: string
  avatar: string | null
  phone: string | null
  roles: string[]
  created_at: string
}

interface UsersIndexProps {
  users: UserRecord[]
  roles: { name: string }[]
  pagination: { page: number; per_page: number; total: number }
}

function UsersIndex({ users, roles, pagination }: UsersIndexProps) {
  const { message } = App.useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定删除该用户？此操作不可撤销。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        router.delete(`/admin/users/${id}`, {
          onSuccess: () => { message.success('删除成功'); router.reload() },
          onError: () => message.error('删除失败'),
        })
      },
    })
  }

  const columns: ProColumns<UserRecord>[] = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    {
      title: '用户',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar
            size={32}
            src={record.avatar}
            icon={!record.avatar ? <UserOutlined /> : undefined}
            style={{ backgroundColor: record.avatar ? 'transparent' : 'var(--ant-color-primary)' }}
          />
          <div>
            <div>{record.name || record.username}</div>
            <div style={{ fontSize: 12, color: 'var(--ant-color-text-secondary)' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '手机号码',
      dataIndex: 'phone',
      key: 'phone',
      render: (_, record) => record.phone || '-',
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (_, record) => (
        <Space>
          {record.roles.map(r => <Tag key={r} color="blue">{r}</Tag>)}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (_, record) => new Date(record.created_at).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setEditingUser(record); setModalOpen(true) }}>编辑</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ]

  return (
    <>
      <ProTable<UserRecord>
        headerTitle="用户管理"
        rowKey="id"
        columns={columns}
        dataSource={users}
        search={false}
        pagination={{
          current: pagination.page,
          pageSize: pagination.per_page,
          total: pagination.total,
        }}
        options={{ density: true, fullScreen: true, reload: false }}
        toolBarRender={() => [
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => { setEditingUser(null); setModalOpen(true) }}>
            新建用户
          </Button>,
        ]}
      />

      <DslModal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
      >
        <ProForm
          initialValues={editingUser ? {
            email: editingUser.email,
            username: editingUser.username,
            name: editingUser.name,
            roles: editingUser.roles,
          } : {}}
          onFinish={async (values) => {
            const method = editingUser ? 'patch' : 'post'
            const url = editingUser ? `/admin/users/${editingUser.id}` : '/admin/users'
            router[method](url, { user: values, roles: values.roles }, {
              onSuccess: () => {
                message.success(editingUser ? '更新成功' : '创建成功')
                setModalOpen(false)
                router.reload()
              },
              onError: () => message.error('操作失败'),
            })
            return true
          }}
          submitter={{
            searchConfig: { submitText: editingUser ? '更新' : '创建' },
            resetButtonProps: { style: { display: 'none' } },
          }}
        >
          <ProFormText name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }]} />
          <ProFormText name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]} />
          <ProFormText name="name" label="姓名" />
          <ProFormText.Password name="password" label="密码" extra={editingUser ? '留空则不修改密码' : undefined} />
          <ProFormSelect
            name="roles"
            label="角色"
            mode="multiple"
            options={roles.map(r => ({ label: r.name, value: r.name }))}
          />
        </ProForm>
      </DslModal>
    </>
  )
}

UsersIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default UsersIndex
