import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { PageContainer, ProTable, ProCard, type ProColumns } from '@ant-design/pro-components'
import { App, Button, Tag, Switch, Space, Drawer, Modal } from 'antd'
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons'
import AdminLayout from '@/layouts/AdminLayout'
import DslModal from '@/modules/dsl/DslModal'
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
  resource_actions: Record<string, string[]>
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

const roleLabels: Record<string, string> = {
  super_admin: '超级管理员',
  admin: '管理员',
  editor: '编辑者',
  viewer: '查看者',
}

function PermissionsIndex({ matrix: initialMatrix, roles, resources, actions, resource_actions }: PermissionsIndexProps) {
  const { message } = App.useApp()
  const [matrix, setMatrix] = useState<RolePermissions[]>(initialMatrix)
  const [selectedRole, setSelectedRole] = useState<RolePermissions | null>(null)

  // 同步 prop 变化（Inertia 重载后）
  useEffect(() => { setMatrix(initialMatrix) }, [initialMatrix])

  // 更新单个权限的工具函数
  const updatePermission = (roleName: string, resource: string, action: string, allowed: boolean) => {
    const updater = (prev: RolePermissions[]) =>
      prev.map((r) =>
        r.role === roleName
          ? {
              ...r,
              permissions: r.permissions.map((p) =>
                p.resource === resource
                  ? { ...p, actions: p.actions.map((a) => a.action === action ? { ...a, allowed } : a) }
                  : p
              ),
            }
          : r
      )
    setMatrix(updater)
    setSelectedRole((prev) => {
      if (!prev || prev.role !== roleName) return prev
      return updater([prev])[0]
    })
  }

  const handleToggle = (roleName: string, resource: string, action: string, currentValue: boolean) => {
    const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || ''
    const newValue = !currentValue

    // 乐观更新
    updatePermission(roleName, resource, action, newValue)

    // 异步请求
    fetch('/admin/permissions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
      body: JSON.stringify({ role_name: roleName, resource: resource, action_name: action, allowed: newValue }),
    }).catch(() => {
      // 失败回滚
      updatePermission(roleName, resource, action, currentValue)
    })
  }

  const handleReset = () => {
    Modal.confirm({
      title: '重置权限',
      content: '确定要重置所有权限为默认值吗？自定义权限配置将丢失。',
      okText: '确认重置',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || ''
        try {
          const res = await fetch('/admin/permissions/reset', {
            method: 'POST',
            headers: { 'X-CSRF-Token': csrfToken },
          })
          if (res.ok) {
            message.success('已重置')
            router.reload()
          } else {
            message.error('重置失败')
          }
        } catch {
          message.error('重置失败')
        }
      },
    })
  }

  // 角色列表数据
  const roleList = matrix.map((roleData) => {
    const totalActions = roleData.permissions.reduce((sum, p) => sum + p.actions.length, 0)
    const allowedActions = roleData.permissions.reduce(
      (sum, p) => sum + p.actions.filter((a) => a.allowed).length, 0
    )
    return {
      role: roleData.role,
      permissions: roleData.permissions,
      totalActions,
      allowedActions,
      resourceCount: roleData.permissions.length,
    }
  })

  const roleColumns: ProColumns[] = [
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (_, record) => (
        <Space>
          <Tag color={roleColors[record.role] || 'default'}>
            {roleLabels[record.role] || record.role}
          </Tag>
          <span style={{ color: 'var(--ant-color-text-secondary)', fontSize: 12 }}>
            {record.role}
          </span>
        </Space>
      ),
    },
    {
      title: '权限范围',
      key: 'scope',
      render: (_, record) => (
        <Space size={4} wrap>
          {record.permissions.slice(0, 4).map((p) => (
            <Tag key={p.resource} color="geekblue">{p.resource}</Tag>
          ))}
          {record.permissions.length > 4 && <Tag>+{record.permissions.length - 4}</Tag>}
        </Space>
      ),
    },
    {
      title: '已授权',
      key: 'stats',
      width: 120,
      render: (_, record) => (
        <span>
          <span style={{ color: '#52c41a', fontWeight: 600 }}>{record.allowedActions}</span>
          <span style={{ color: 'var(--ant-color-text-secondary)' }}> / {record.totalActions}</span>
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          icon={<SettingOutlined />}
          onClick={() => setSelectedRole(record)}
        >
          配置权限
        </Button>
      ),
    },
  ]

  return (
    <PageContainer
      title="权限管理"
      subTitle="按角色配置资源操作权限"
      extra={
        <Button icon={<ReloadOutlined />} onClick={handleReset}>重置默认</Button>
      }
    >
      <ProTable
        headerTitle="角色列表"
        rowKey="role"
        columns={roleColumns}
        dataSource={roleList}
        search={false}
        pagination={false}
        options={false}
      />

      {/* 角色权限配置抽屉 */}
      <Drawer
        title={
          <Space>
            <span>权限配置</span>
            {selectedRole && (
              <Tag color={roleColors[selectedRole.role] || 'default'}>
                {roleLabels[selectedRole.role] || selectedRole.role}
              </Tag>
            )}
          </Space>
        }
        open={!!selectedRole}
        onClose={() => setSelectedRole(null)}
        size="default"
      >
        {selectedRole && (() => {
          // 收集当前角色所有资源的有效操作并集（保持顺序）
          const allActions = Array.from(new Set(
            selectedRole.permissions.flatMap((p) => p.actions.map((a) => a.action))
          ))

          return (
            <ProCard>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid var(--ant-color-border)', fontWeight: 600 }}>
                      资源
                    </th>
                    {allActions.map((action) => (
                      <th key={action} style={{ padding: '8px 8px', textAlign: 'center', borderBottom: '2px solid var(--ant-color-border)', fontWeight: 600, fontSize: 12 }}>
                        {actionLabels[action] || action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedRole.permissions.map((resourcePerm) => (
                    <tr key={resourcePerm.resource}>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--ant-color-border-secondary)' }}>
                        <Tag color="geekblue">{resourcePerm.resource}</Tag>
                      </td>
                      {allActions.map((action) => {
                        const actionData = resourcePerm.actions.find((a) => a.action === action)
                        return (
                          <td key={action} style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '1px solid var(--ant-color-border-secondary)' }}>
                            {actionData ? (
                              <Switch
                                size="small"
                                checked={actionData.allowed}
                                onChange={() => handleToggle(selectedRole.role, resourcePerm.resource, action, actionData.allowed)}
                              />
                            ) : (
                              <span style={{ color: 'var(--ant-color-text-quaternary)' }}>—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </ProCard>
          )
        })()}
      </Drawer>
    </PageContainer>
  )
}

PermissionsIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default PermissionsIndex
