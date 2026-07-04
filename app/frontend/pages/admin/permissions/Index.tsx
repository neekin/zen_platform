import { useState } from 'react'
import { router } from '@inertiajs/react'
import { PageContainer, ProCard } from '@ant-design/pro-components'
import { App, Button, Table, Tag, Switch, Space, Modal } from 'antd'
import { ReloadOutlined, SaveOutlined } from '@ant-design/icons'
import AdminLayout from '../../../layouts/AdminLayout'
import type { ReactNode } from 'react'

interface PermissionAction {
  action: string
  allowed: boolean
  persisted: boolean
}

interface ResourcePermission {
  resource: string
  actions: PermissionAction[]
}

interface RolePermissions {
  role: string
  permissions: ResourcePermission[]
}

interface PermissionsIndexProps {
  matrix: RolePermissions[]
  roles: string[]
  resources: string[]
  actions: string[]
}

const actionLabels: Record<string, string> = {
  index: '查看列表',
  show: '查看详情',
  create: '创建',
  update: '编辑',
  destroy: '删除',
  restore: '还原',
  mark_as_read: '标记已读',
  mark_all_as_read: '全部已读',
}

const roleColors: Record<string, string> = {
  super_admin: 'red',
  admin: 'orange',
  editor: 'blue',
  viewer: 'green',
}

function PermissionsIndex({ matrix, roles, resources, actions }: PermissionsIndexProps) {
  const { message } = App.useApp()
  const [saving, setSaving] = useState(false)

  const handleToggle = (roleName: string, resource: string, action: string, currentValue: boolean) => {
    router.patch('/admin/permissions', {
      role_name: roleName,
      resource: resource,
      action_name: action,
      allowed: !currentValue,
    }, {
      onSuccess: () => message.success('权限已更新'),
      onError: () => message.error('更新失败'),
    })
  }

  const handleReset = () => {
    Modal.confirm({
      title: '重置权限',
      content: '确定要重置所有权限为默认值吗？自定义权限配置将丢失。',
      okText: '确认重置',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        router.post('/admin/permissions/reset', {}, {
          onSuccess: () => { message.success('已重置'); router.reload() },
          onError: () => message.error('重置失败'),
        })
      },
    })
  }

  // 构建表格数据：每行一个资源，每列一个角色的权限
  const dataSource = resources.map((resource) => {
    const row: Record<string, any> = { key: resource, resource }
    matrix.forEach((roleData) => {
      const resourcePerm = roleData.permissions.find((p) => p.resource === resource)
      if (resourcePerm) {
        resourcePerm.actions.forEach((actionData) => {
          row[`${roleData.role}_${actionData.action}`] = actionData
        })
      }
    })
    return row
  })

  const columns: any[] = [
    {
      title: '资源',
      dataIndex: 'resource',
      key: 'resource',
      width: 120,
      fixed: 'left',
      render: (text: string) => <Tag color="geekblue">{text}</Tag>,
    },
    ...roles.map((role) => ({
      title: (
        <Space>
          <Tag color={roleColors[role] || 'default'}>{role}</Tag>
        </Space>
      ),
      key: role,
      children: actions.map((action) => ({
        title: actionLabels[action] || action,
        key: `${role}_${action}`,
        width: 90,
        align: 'center' as const,
        render: (_: any, record: Record<string, any>) => {
          const perm = record[`${role}_${action}`]
          if (!perm) return <span style={{ color: '#ccc' }}>-</span>
          return (
            <Switch
              size="small"
              checked={perm.allowed}
              onChange={() => handleToggle(role, record.resource, action, perm.allowed)}
            />
          )
        },
      })),
    })),
  ]

  return (
    <PageContainer
      title="权限管理"
      subTitle="配置角色对资源的操作权限"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>重置默认</Button>
        </Space>
      }
    >
      <ProCard>
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          scroll={{ x: roles.length * actions.length * 90 + 120 }}
          bordered
          size="small"
        />
      </ProCard>
    </PageContainer>
  )
}

PermissionsIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default PermissionsIndex
