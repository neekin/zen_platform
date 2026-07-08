import React from 'react'
import { router, usePage } from '@inertiajs/react'
import { ProDescriptions } from '@ant-design/pro-components'
import { Tag, Typography, Button, Drawer, App, Modal } from 'antd'
import AdminLayout from '@/layouts/AdminLayout'
import CRUDDataTable from '@/components/admin/CRUDDataTable'
import type { ReactNode } from 'react'

interface AuditLog {
  id: number
  item_type: string
  item_id: number
  event: string
  whodunnit: string | null
  object_changes: Record<string, [unknown, unknown]> | null
  metadata: Record<string, unknown> | null
  created_at: string
}

type Props = {
  audit_logs: AuditLog[]
  filters: {
    item_types: string[]
    events: string[]
  }
}

const eventColors: Record<string, string> = {
  create: 'green',
  update: 'blue',
  destroy: 'red',
}

const eventLabels: Record<string, string> = {
  create: '创建',
  update: '更新',
  destroy: '删除',
}

export default function AuditLogsIndex() {
  const { audit_logs, filters } = usePage<{ props: Props }>().props as unknown as Props
  const { message } = App.useApp()
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null)
  const [restoring, setRestoring] = React.useState(false)

  const canRestore = (log: AuditLog | null): boolean => {
    if (!log) return false
    return ['update', 'destroy'].includes(log.event)
  }

  const handleRestore = async (log: AuditLog) => {
    const confirmed = await new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: '确认还原',
        content: `确定要还原此${eventLabels[log.event] || log.event}操作吗？还原后数据将恢复到此版本的状态。`,
        okText: '确认还原',
        cancelText: '取消',
        okButtonProps: { danger: true },
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      })
    })

    if (!confirmed) return

    setRestoring(true)
    try {
      router.post(`/admin/audit_logs/${log.id}/restore`, {}, {
        onSuccess: () => {
          message.success('还原成功')
          setSelectedLog(null)
          router.reload()
        },
        onError: (errors) => {
          const errorMsg = typeof errors === 'object' ? Object.values(errors).join(', ') : String(errors)
          message.error(`还原失败: ${errorMsg}`)
        },
        onFinish: () => setRestoring(false),
      })
    } catch {
      setRestoring(false)
    }
  }

  const columns = [
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (_: any, record: AuditLog) => new Date(record.created_at).toLocaleString('zh-CN'),
      sorter: (a: AuditLog, b: AuditLog) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: '操作',
      dataIndex: 'event',
      key: 'event',
      width: 100,
      filters: filters.events.map((e) => ({ text: eventLabels[e] || e, value: e })),
      onFilter: (value: any, record: AuditLog) => record.event === value,
      render: (_: any, record: AuditLog) => (
        <Tag color={eventColors[record.event] || 'default'}>
          {eventLabels[record.event] || record.event}
        </Tag>
      ),
    },
    {
      title: '模型',
      dataIndex: 'item_type',
      key: 'item_type',
      width: 120,
      filters: filters.item_types.map((t) => ({ text: t, value: t })),
      onFilter: (value: any, record: AuditLog) => record.item_type === value,
      render: (_: any, record: AuditLog) => <Tag>{record.item_type}</Tag>,
    },
    {
      title: '记录 ID',
      dataIndex: 'item_id',
      key: 'item_id',
      width: 100,
    },
    {
      title: '操作人',
      dataIndex: 'whodunnit',
      key: 'whodunnit',
      width: 120,
      render: (_: any, record: AuditLog) => record.whodunnit || '-',
    },
    {
      title: '变更',
      dataIndex: 'object_changes',
      key: 'object_changes',
      ellipsis: true,
      render: (_: any, record: AuditLog) => {
        if (!record.object_changes) return '-'
        const fields = Object.keys(record.object_changes)
        return (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {fields.slice(0, 3).map((f) => (
              <Tag key={f} color="orange">{f}</Tag>
            ))}
            {fields.length > 3 && <Tag>+{fields.length - 3}</Tag>}
          </div>
        )
      },
    },
  ]

  return (
    <>
      <CRUDDataTable<AuditLog>
        headerTitle="审计日志"
        rowKey="id"
        columns={columns}
        dataSource={audit_logs}
        pagination={false}
        crudConfig={{
          resource: 'audit_logs',
          enableCreate: false,
          enableEdit: false,
          enableDelete: false,
          extraActions: (record) => [
            {
              key: 'detail',
              label: '查看',
              onClick: () => setSelectedLog(record),
            },
          ],
        }}
      />

      <Drawer
        title="变更详情"
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        size="default"
        extra={
          selectedLog && canRestore(selectedLog) ? (
            <Button
              type="primary"
              danger
              loading={restoring}
              onClick={() => handleRestore(selectedLog)}
            >
              还原到此版本
            </Button>
          ) : undefined
        }
      >
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ProDescriptions column={1} bordered size="small">
              <ProDescriptions.Item label="时间">
                {new Date(selectedLog.created_at).toLocaleString('zh-CN')}
              </ProDescriptions.Item>
              <ProDescriptions.Item label="操作">
                <Tag color={eventColors[selectedLog.event] || 'default'}>
                  {eventLabels[selectedLog.event] || selectedLog.event}
                </Tag>
              </ProDescriptions.Item>
              <ProDescriptions.Item label="模型">{selectedLog.item_type}</ProDescriptions.Item>
              <ProDescriptions.Item label="记录 ID">{selectedLog.item_id}</ProDescriptions.Item>
              <ProDescriptions.Item label="操作人">{selectedLog.whodunnit || '-'}</ProDescriptions.Item>
            </ProDescriptions>

            {selectedLog.object_changes && (
              <>
                <Typography.Text strong>字段变更</Typography.Text>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>字段</th>
                      <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>旧值</th>
                      <th style={{ border: '1px solid #ddd', padding: 8, textAlign: 'left' }}>新值</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedLog.object_changes).map(([field, [oldVal, newVal]]) => (
                      <tr key={field}>
                        <td style={{ border: '1px solid #ddd', padding: 8 }}>{field}</td>
                        <td style={{ border: '1px solid #ddd', padding: 8, color: '#ff4d4f' }}>
                          {oldVal == null ? '-' : String(oldVal)}
                        </td>
                        <td style={{ border: '1px solid #ddd', padding: 8, color: '#52c41a' }}>
                          {newVal == null ? '-' : String(newVal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
              <>
                <Typography.Text strong>元数据</Typography.Text>
                <ProDescriptions column={1} bordered size="small">
                  {Object.entries(selectedLog.metadata).map(([key, value]) => (
                    <ProDescriptions.Item key={key} label={key}>
                      {String(value)}
                    </ProDescriptions.Item>
                  ))}
                </ProDescriptions>
              </>
            )}
          </div>
        )}
      </Drawer>
    </>
  )
}

AuditLogsIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
