import { useState } from 'react'
import { router } from '@inertiajs/react'
import { ProTable, ProForm, ProFormText, ProFormSelect, ProFormDateTimePicker, type ProColumns } from '@ant-design/pro-components'
import { App, Button, Space, Tag, Typography, Input, Modal } from 'antd'
import { PlusOutlined, DeleteOutlined, CopyOutlined, KeyOutlined } from '@ant-design/icons'
import AdminLayout from '../../../layouts/AdminLayout'
import DslModal from '../../../modules/dsl/DslModal'
import type { ReactNode } from 'react'

const { Text, Paragraph } = Typography

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

interface ApiKeysIndexProps {
  api_keys: ApiKeyRecord[]
  users: { id: number; label: string }[]
  pagination: { page: number; per_page: number; total: number }
}

function ApiKeysIndex({ api_keys, users, pagination }: ApiKeysIndexProps) {
  const { message } = App.useApp()
  const [createOpen, setCreateOpen] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)

  const handleDelete = (record: ApiKeyRecord) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定删除 API Key「${record.name}」？此操作不可撤销，使用该 Key 的服务将立即失去访问权限。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        router.delete(`/admin/api_keys/${record.id}`)
      },
    })
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      message.success('已复制到剪贴板')
    }).catch(() => {
      message.error('复制失败，请手动选择复制')
    })
  }

  const columns: ProColumns<ApiKeyRecord>[] = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 150 },
    {
      title: 'Key',
      dataIndex: 'key_masked',
      key: 'key_masked',
      render: (_, record) => (
        <Space>
          <Text code>{record.key_masked}</Text>
          <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => handleCopy(record.key)}>
            复制
          </Button>
        </Space>
      ),
    },
    { title: '所属用户', dataIndex: 'user_name', key: 'user_name', width: 120 },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: (_, record) => {
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
      render: (_, record) => record.expires_at
        ? new Date(record.expires_at).toLocaleString('zh-CN')
        : '永不过期',
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
      width: 80,
      render: (_, record) => (
        <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
          删除
        </Button>
      ),
    },
  ]

  return (
    <>
      <ProTable<ApiKeyRecord>
        headerTitle="API Key 管理"
        rowKey="id"
        columns={columns}
        dataSource={api_keys}
        search={false}
        pagination={{
          current: pagination.page,
          pageSize: pagination.per_page,
          total: pagination.total,
        }}
        options={{ density: true, fullScreen: true, reload: false }}
        toolBarRender={() => [
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => { setNewKey(null); setCreateOpen(true) }}>
            新建 API Key
          </Button>,
        ]}
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
          <Space>
            <KeyOutlined />
            <span>API Key 创建成功</span>
          </Space>
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
