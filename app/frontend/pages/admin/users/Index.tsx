import { App, Tag, Avatar } from 'antd'
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'
import AdminLayout from '@/layouts/AdminLayout'
import CRUDDataTable from '@/components/admin/CRUDDataTable'
import { useTranslation } from 'react-i18next'
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

type UsersIndexProps = {
  users: UserRecord[]
  roles: { name: string }[]
  pagination: { page: number; per_page: number; total: number }
}

function UsersIndex({ users, roles, pagination }: UsersIndexProps) {
  const { t } = useTranslation()

  const columns = [
    { title: t('users.id'), dataIndex: 'id', key: 'id', width: 80 },
    {
      title: t('users.user'),
      key: 'user',
      render: (_: any, record: UserRecord) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
        </div>
      ),
    },
    {
      title: t('users.phone'),
      dataIndex: 'phone',
      key: 'phone',
      render: (_: any, record: UserRecord) => record.phone || '-',
    },
    {
      title: t('users.role'),
      dataIndex: 'roles',
      key: 'roles',
      render: (_: any, record: UserRecord) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {record.roles.map(r => <Tag key={r} color="blue">{r}</Tag>)}
        </div>
      ),
    },
    {
      title: t('users.createdAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (_: any, record: UserRecord) => new Date(record.created_at).toLocaleString(),
    },
  ]

  const userFields = [
    { name: 'email', label: t('users.email'), type: 'text' as const, rules: [{ required: true, message: t('users.emailPlaceholder') }] },
    { name: 'username', label: t('users.username'), type: 'text' as const, rules: [{ required: true, message: t('users.usernamePlaceholder') }] },
    { name: 'name', label: t('users.name'), type: 'text' as const },
    { name: 'password', label: t('users.password'), type: 'password' as const, extra: t('users.passwordHint') },
    {
      name: 'roles',
      label: t('users.roles'),
      type: 'select' as const,
      options: roles.map(r => ({ label: r.name, value: r.name })),
    },
  ]

  return (
    <CRUDDataTable<UserRecord>
      headerTitle={t('users.title')}
      rowKey="id"
      columns={columns}
      dataSource={users}
      pagination={{
        current: pagination.page,
        pageSize: pagination.per_page,
        total: pagination.total,
      }}
      crudConfig={{
        resource: 'users',
        createTitle: t('users.newUser'),
        editTitle: t('users.editUser'),
        createFields: userFields,
        editFields: userFields,
        getEditValues: (record) => ({
          email: record.email,
          username: record.username,
          name: record.name,
          roles: record.roles,
        }),
      }}
    />
  )
}

UsersIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default UsersIndex
