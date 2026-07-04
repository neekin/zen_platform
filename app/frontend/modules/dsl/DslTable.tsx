import { PageContainer, ProTable } from '@ant-design/pro-components'
import { Button, Space, Popconfirm, App, Input } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import { useState, useCallback } from 'react'
import type { ProColumns } from '@ant-design/pro-components'
import type { DslMeta } from '../../types/dsl'
import { buildColumns } from './columnRenderer'

export interface PaginationConfig {
  current: number
  pageSize: number
  total: number
}

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
  onBulkDelete?: (ids: React.Key[]) => void
  /** 批量操作 */
  batchActions?: Array<{ name: string; label: string; confirm?: string }>
  onBatchAction?: (actionName: string, ids: React.Key[]) => void
  /** 创建按钮回调（modal 模式下使用） */
  onCreate?: () => void
  /** 编辑按钮回调（modal 模式下使用） */
  onEdit?: (record: Record<string, any>) => void
  /** 服务端分页配置 */
  pagination?: PaginationConfig
  /** 开启服务端模式 */
  serverSide?: boolean
  /** 服务端请求回调 */
  onServerChange?: (params: { page: number; perPage: number; q?: string; filters?: Record<string, any> }) => void
}

export default function DslTable({
  meta,
  data,
  basePath,
  createText,
  showActions = true,
  extraColumns = [],
  rowSelection,
  onBulkDelete,
  batchActions,
  onBatchAction,
  onCreate,
  onEdit,
  pagination,
  serverSide = false,
  onServerChange,
}: DslTableProps) {
  const { message } = App.useApp()
  const [searchText, setSearchText] = useState('')

  const handleSearch = useCallback((value: string) => {
    if (serverSide && onServerChange) {
      onServerChange({ page: 1, perPage: pagination?.pageSize || 20, q: value })
    }
  }, [serverSide, onServerChange, pagination])

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
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit ? onEdit(record) : router.visit(`${basePath}/${record.id}/edit`)}>编辑</Button>
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

  const tablePagination = serverSide && pagination
    ? {
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showTotal: (total: number) => `共 ${total} 条`,
        onChange: (page: number, pageSize: number) => {
          onServerChange?.({ page, perPage: pageSize, q: searchText })
        },
      }
    : { defaultPageSize: 20, showSizeChanger: true }

  return (
    <PageContainer>
      <ProTable
        columns={columns}
        dataSource={data}
        rowKey="id"
        search={false}
        rowSelection={rowSelection}
        pagination={tablePagination}
        toolBarRender={() => {
          const items: React.ReactNode[] = []

          if (serverSide) {
            items.push(
              <Input.Search
                key="search"
                placeholder="搜索..."
                allowClear
                onSearch={handleSearch}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
              />
            )
          }

          if (rowSelection && rowSelection.selectedRowKeys.length > 0) {
            if (batchActions) {
              batchActions.forEach((action) => {
                items.push(
                  <Popconfirm
                    key={action.name}
                    title={action.confirm || `确定执行"${action.label}"？`}
                    onConfirm={() => onBatchAction?.(action.name, rowSelection.selectedRowKeys)}
                  >
                    <Button size="small">{action.label}</Button>
                  </Popconfirm>
                )
              })
            }
            if (onBulkDelete) {
              items.push(
                <Popconfirm key="bulk" title={`确定删除 ${rowSelection.selectedRowKeys.length} 项？`} onConfirm={() => onBulkDelete(rowSelection.selectedRowKeys)}>
                  <Button danger size="small">批量删除 ({rowSelection.selectedRowKeys.length})</Button>
                </Popconfirm>
              )
            }
          }
          if (createText) {
            items.push(
              <Button key="add" type="primary" icon={<PlusOutlined />}
                onClick={() => onCreate ? onCreate() : router.visit(`${basePath}/new`)}>
                {createText}
              </Button>
            )
          }
          return items
        }}
      />
    </PageContainer>
  )
}
