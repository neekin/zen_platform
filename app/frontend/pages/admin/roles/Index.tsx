import { App, Tag } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import AdminLayout from '@/layouts/AdminLayout'
import CRUDDataTable from '@/components/admin/CRUDDataTable'
import type { ReactNode } from 'react'

interface RoleRecord {
  id: number
  name: string
  users_count: number
}

type RolesIndexProps = {
  roles: RoleRecord[]
}

function RolesIndex({ roles }: RolesIndexProps) {
  const { message } = App.useApp()

  const builtInRoles = ['super_admin', 'admin', 'editor', 'viewer']

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, record: RoleRecord) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tag color={builtInRoles.includes(record.name) ? 'blue' : 'default'}>{record.name}</Tag>
          {builtInRoles.includes(record.name) && <Tag color="gold">内置</Tag>}
        </div>
      ),
    },
    { title: '用户数', dataIndex: 'users_count', key: 'users_count', width: 100 },
  ]

  return (
    <CRUDDataTable<RoleRecord>
      headerTitle="角色管理"
      rowKey="id"
      columns={columns}
      dataSource={roles}
      pagination={false}
      crudConfig={{
        resource: 'roles',
        createTitle: '新建角色',
        createFields: [
          { name: 'name', label: '角色名称', type: 'text', rules: [{ required: true, message: '请输入角色名称' }] },
        ],
        enableEdit: false,
        deleteConfirm: (record) => `确定删除角色 "${record.name}"？`,
        onDelete: (record) => {
          if (builtInRoles.includes(record.name)) {
            message.warning('内置角色不能删除')
            throw new Error('内置角色不能删除')
          }
        },
      }}
    />
  )
}

RolesIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default RolesIndex
