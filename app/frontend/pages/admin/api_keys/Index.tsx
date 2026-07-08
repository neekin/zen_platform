import { useState } from 'react'
import { router } from '@inertiajs/react'
import { ProForm, ProFormText, ProFormSelect, ProFormDateTimePicker } from '@ant-design/pro-components'
import { App, Button, Tag, Typography, Input, Modal } from 'antd'
import { PlusOutlined, DeleteOutlined, CopyOutlined, KeyOutlined } from '@ant-design/icons'
import AdminLayout from '@/layouts/AdminLayout'
import CRUDDataTable from '@/components/admin/CRUDDataTable'
import DslModal from '@/modules/dsl/DslModal'
import type { ReactNode } from 'react'

const { Paragraph } = Typography

interface ApiKeyRecord {
  id: number
  name: string
  key_masked: string
  key: string
  user_id: number
  user_name: string
  expires_at: string | null
  expired: boolean
  created_at: string
}

type ApiKeysIndexProps = {
  api_keys: ApiKeyRecord[]
  users: { id: number; label: string }[]
  pagination: { page: number; per_page: number; total: number }
}

function ApiKeysIndex({ api_keys, users, pagination }: ApiKeysIndexProps) {
  const { message } = App.useApp()
  const [createOpen, setCreateOpen] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('已复制到剪贴板')
    }).catch(() => {
      message.error('复制失败，请手动选择复制')
    })
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 150 },
    {
      title: 'Key',
      dataIndex: 'key_masked',
      key: 'key_masked',
      render: (_: any, record: ApiKeyRecord) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Typography.Text code>{record.key_masked}</Typography.Text>
          <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => handleCopy(record.key)}>
            复制
          </Button>
        </div>
      ),
    },
    { title: '所属用户', dataIndex: 'user_name', key: 'user_name', width: 120 },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (_: any, record: ApiKeyRecord) => {
        if (record.expired) return <Tag color="red">已过期</Tag>
        if (!record.expires_at) return <Tag color="green">永久</Tag>
        return <Tag color="blue">有效</Tag>
      },
    },
    {
      title: '过期时间',
      dataIndex: 'expires_at',
      key: 'expires_at',
      width: 180,
      render: (_: any, record: ApiKeyRecord) => record.expires_at
        ? new Date(record.expires_at).toLocaleString('zh-CN')
        : '永不过期',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (_: any, record: ApiKeyRecord) => new Date(record.created_at).toLocaleString('zh-CN'),
    },
  ]

  return (
    <>
      <CRUDDataTable<ApiKeyRecord>
        headerTitle="API Key 管理"
        rowKey="id"
        columns={columns}
        dataSource={api_keys}
        pagination={{
          current: pagination.page,
          pageSize: pagination.per_page,
          total: pagination.total,
        }}
        toolBarRender={() => [
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => { setNewKey(null); setCreateOpen(true) }}>
            新建 API Key
          </Button>,
        ]}
        crudConfig={{
          resource: 'api_keys',
          enableCreate: false,
          enableEdit: false,
          deleteConfirm: (record) => `确定删除 API Key「${record.name}」？此操作不可撤销，使用该 Key 的服务将立即失去访问权限。`,
        }}
      />

      {/* 创建 API Key 表单 */}
      <DslModal
        title="新建 API Key"
        open={createOpen && !newKey}
        onCancel={() => setCreateOpen(false)}
        footer={null}
        width={500}
      >
        <ProForm
          onFinish={async (values) => {
            try {
              const resp = await fetch('/admin/api_keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ api_key: values }),
              })
              const data = await resp.json()
              if (data.code === 0) {
                message.success('创建成功')
                setNewKey(data.data.key)
              } else {
                message.error(data.message || '创建失败')
              }
            } catch {
              message.error('创建失败')
            }
            return true
          }}
          submitter={{
            searchConfig: { submitText: '创建' },
            resetButtonProps: { style: { display: 'none' } },
          }}
        >
          <ProFormText
            name="name"
            label="名称"
            placeholder="例如：移动端 API、第三方对接"
            rules={[{ required: true, message: '请输入名称' }]}
          />
          <ProFormSelect
            name="user_id"
            label="所属用户"
            placeholder="选择绑定的用户"
            options={users.map(u => ({ label: u.label, value: u.id }))}
            rules={[{ required: true, message: '请选择用户' }]}
          />
          <ProFormDateTimePicker
            name="expires_at"
            label="过期时间"
            placeholder="留空则永不过期"
            extra="过期后该 Key 自动失效"
          />
        </ProForm>
      </DslModal>

      {/* 创建成功后显示 Key */}
      <DslModal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <KeyOutlined />
            <span>API Key 创建成功</span>
          </div>
        }
        open={!!newKey}
        onCancel={() => { setNewKey(null); setCreateOpen(false); router.reload() }}
        footer={[
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={() => handleCopy(newKey!)}>
            复制 Key
          </Button>,
          <Button key="close" onClick={() => { setNewKey(null); setCreateOpen(false); router.reload() }}>
            完成
          </Button>,
        ]}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Paragraph type="warning">
            请立即复制并保存此 Key，关闭后将无法再次查看完整内容。
          </Paragraph>
        </div>
        <Input.Group compact>
          <Input
            style={{ width: 'calc(100% - 80px)' }}
            value={newKey || ''}
            readOnly
          />
          <Button
            style={{ width: 80 }}
            icon={<CopyOutlined />}
            onClick={() => handleCopy(newKey!)}
          >
            复制
          </Button>
        </Input.Group>
      </DslModal>
    </>
  )
}

ApiKeysIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default ApiKeysIndex
