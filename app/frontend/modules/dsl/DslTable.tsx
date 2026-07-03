import { PageContainer, ProTable } from '@ant-design/pro-components'
import { Button, Space, Popconfirm, App } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import type { ProColumns } from '@ant-design/pro-components'
import type { DslMeta } from '../../types/dsl'
import { buildColumns } from './columnRenderer'

export interface DslTableProps {
  meta: DslMeta
  data: Record<string, any>[]
  basePath: string
  createText?: string
  showActions?: boolean
  extraColumns?: ProColumns[]
  rowSelection?: {
    selectedRowKeys: React.Key[]
    onChange: (keys: React.Key[]) => void
  }
}

export default function DslTable({
  meta,
  data,
  basePath,
  createText,
  showActions = true,
  extraColumns = [],
  rowSelection,
}: DslTableProps) {
  const { message } = App.useApp()
  const columns: ProColumns[] = [
    ...buildColumns(meta, basePath),
    ...extraColumns,
  ]

  if (showActions) {
    columns.push({
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => router.visit(`${basePath}/${record.id}`)}>查看</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => router.visit(`${basePath}/${record.id}/edit`)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => {
            router.delete(`${basePath}/${record.id}`, {
              onSuccess: () => message.success('删除成功'),
            })
          }}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    })
  }

  return (
    <PageContainer>
      <ProTable
        columns={columns}
        dataSource={data}
        rowKey="id"
        search={false}
        rowSelection={rowSelection}
        toolBarRender={() =>
          createText
            ? [<Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => router.visit(`${basePath}/new`)}>{createText}</Button>]
            : []
        }
      />
    </PageContainer>
  )
}
