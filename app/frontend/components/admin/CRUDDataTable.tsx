/**
 * CRUDDataTable - 统一 CRUD 表格组件
 *
 * 封装列表 + 新建 + 编辑 + 删除的通用行为：
 * - 列表：ProTable + 固定列 + 横向滚动
 * - 新建/编辑：Modal + ProForm
 * - 删除：Modal.confirm
 * - 操作栏：最多3个直接按钮 + Dropdown
 */
import { useState, useCallback } from 'react'
import { ProTable, ProForm, type ProColumns } from '@ant-design/pro-components'
import { App, Button, Modal, Space, Dropdown, Input, InputNumber, Select, Switch } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import type { ReactNode } from 'react'

// ============ 类型定义 ============

export interface FormField {
  name: string
  label: string
  type?: 'text' | 'textarea' | 'select' | 'number' | 'switch' | 'password'
  rules?: any[]
  options?: { label: string; value: any }[]
  placeholder?: string
  disabled?: boolean
  extra?: string
}

export interface ActionItem {
  key: string
  label: string
  icon?: ReactNode
  onClick?: () => void
  danger?: boolean
  disabled?: boolean
  hidden?: boolean
}

export interface CRUDConfig<T> {
  /** 资源名称（用于 API 路径） */
  resource: string
  /** API 基础路径，默认 /admin */
  basePath?: string
  /** 是否启用新建 */
  enableCreate?: boolean
  /** 是否启用编辑 */
  enableEdit?: boolean
  /** 是否启用删除 */
  enableDelete?: boolean
  /** 新建表单标题 */
  createTitle?: string
  /** 编辑表单标题 */
  editTitle?: string
  /** 新建表单字段 */
  createFields?: FormField[]
  /** 编辑表单字段（不传则复用 createFields） */
  editFields?: FormField[]
  /** 编辑时获取初始值 */
  getEditValues?: (record: T) => Record<string, any>
  /** 删除确认文本 */
  deleteConfirm?: (record: T) => string
  /** 额外操作按钮（在编辑/删除之外） */
  extraActions?: (record: T) => ActionItem[]
  /** 新建前回调 */
  onCreate?: () => void
  /** 编辑前回调 */
  onEdit?: (record: T) => void
  /** 删除前回调 */
  onDelete?: (record: T) => void
  /** 提交后刷新 */
  afterSubmit?: () => void
}

interface CRUDDataTableProps<T> {
  headerTitle?: ReactNode
  columns: ProColumns<T>[]
  dataSource: T[]
  pagination: { current: number; pageSize: number; total: number } | false | false
  crudConfig: CRUDConfig<T>
  fixedLeftKeys?: string[]
  scrollX?: number
  rowKey?: string
  toolBarRender?: () => ReactNode[]
}

// ============ CRUDDataTable 组件 ============

export default function CRUDDataTable<T extends Record<string, any>>({
  headerTitle,
  columns: rawColumns,
  dataSource,
  pagination,
  crudConfig,
  fixedLeftKeys = ['id'],
  scrollX = 1200,
  rowKey = 'id',
  toolBarRender,
}: CRUDDataTableProps<T>) {
  const { message } = App.useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<T | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    resource,
    basePath = '/admin',
    enableCreate = true,
    enableEdit = true,
    enableDelete = true,
    createTitle = '新建',
    editTitle = '编辑',
    createFields = [],
    editFields,
    getEditValues,
    deleteConfirm,
    extraActions,
    afterSubmit,
  } = crudConfig

  // 构建 URL
  const getBaseUrl = useCallback(() => `${basePath}/${resource}`, [basePath, resource])

  // 打开新建弹窗
  const handleCreate = () => {
    setEditingRecord(null)
    setModalOpen(true)
  }

  // 打开编辑弹窗
  const handleEdit = (record: T) => {
    setEditingRecord(record)
    setModalOpen(true)
  }

  // 删除
  const handleDelete = (record: T) => {
    const confirmText = deleteConfirm?.(record) || `确定要删除吗？`
    Modal.confirm({
      title: '确认删除',
      content: confirmText,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        router.delete(`${getBaseUrl()}/${record.id}`, {
          onSuccess: () => message.success('删除成功'),
          onError: (e) => message.error(typeof e === 'object' ? Object.values(e).flat().join(', ') : '删除失败'),
        })
      },
    })
  }

  // 提交表单（新建/编辑）
  const handleSubmit = async (values: Record<string, any>) => {
    setSubmitting(true)
    try {
      const isEdit = !!editingRecord
      const url = isEdit ? `${getBaseUrl()}/${editingRecord.id}` : getBaseUrl()
      const method = isEdit ? 'patch' : 'post'
      const key = resource.replace(/_/g, '/').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()

      router[method](url, { [key]: values }, {
        onSuccess: () => {
          message.success(isEdit ? '编辑成功' : '创建成功')
          setModalOpen(false)
          setEditingRecord(null)
          afterSubmit?.()
        },
        onError: (e) => {
          const msg = typeof e === 'object' ? Object.values(e).flat().join(', ') : '操作失败'
          message.error(msg)
        },
        onFinish: () => setSubmitting(false),
      })
    } catch {
      setSubmitting(false)
    }
  }

  // 处理列：固定左侧
  const columns: ProColumns<T>[] = rawColumns.map((col) => {
    const key = (col.key || col.dataIndex) as string
    if (fixedLeftKeys.includes(key)) {
      return { ...col, fixed: 'left' as const }
    }
    return col
  })

  // 添加操作列
  if (enableEdit || enableDelete || extraActions) {
    columns.push({
      title: '操作',
      key: '_actions',
      width: 320,
      search: false,
      render: (_, record) => {
        const direct: ActionItem[] = []
        const dropdown: ActionItem[] = []

        // 额外操作 - 前3个放 direct，其余放 dropdown
        extraActions?.(record)?.forEach((a) => {
          if (direct.length < 3) {
            direct.push(a)
          } else {
            dropdown.push(a)
          }
        })

        // 编辑
        if (enableEdit) {
          direct.push({
            key: 'edit', label: '编辑', icon: <EditOutlined />,
            onClick: () => handleEdit(record),
          })
        }

        // 删除
        if (enableDelete) {
          dropdown.push({
            key: 'delete', label: '删除', danger: true, icon: <DeleteOutlined />,
            onClick: () => handleDelete(record),
          })
        }

        const showDirect = direct.slice(0, 3)
        const showDropdown = [...direct.slice(3), ...dropdown]

        return (
          <Space size={4}>
            {showDirect.map((item) => (
              <Button key={item.key} type="link" size="small" icon={item.icon}
                danger={item.danger} disabled={item.disabled} onClick={item.onClick}>
                {item.label}
              </Button>
            ))}
            {showDropdown.length > 0 && (
              <Dropdown menu={{
                items: showDropdown.map((item) => ({
                  key: item.key, icon: item.icon, label: item.label,
                  danger: item.danger, disabled: item.disabled, onClick: item.onClick,
                })),
              }}>
                <Button type="link" size="small" icon={<MoreOutlined />}>更多</Button>
              </Dropdown>
            )}
          </Space>
        )
      },
    })
  }

  // 获取编辑表单字段
  const fields = editingRecord
    ? (editFields || createFields).map((f) => ({
        ...f,
        disabled: f.disabled || (f.name === 'key' && !!editingRecord),
      }))
    : createFields

  // 获取编辑初始值
  const initialValues = editingRecord && getEditValues
    ? getEditValues(editingRecord)
    : editingRecord
      ? Object.fromEntries(fields.map((f) => [f.name, (editingRecord as any)[f.name]]))
      : {}

  return (
    <>
      <ProTable<T>
        headerTitle={headerTitle}
        rowKey={rowKey}
        columns={columns}
        dataSource={dataSource}
        search={false}
        scroll={{ x: scrollX }}
        pagination={pagination === false ? false : {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, pageSize) => {
            router.get(getBaseUrl(), { page, per_page: pageSize })
          },
        }}
        options={{ density: true, fullScreen: true, reload: false }}
        toolBarRender={() => [
          ...(toolBarRender?.() || []),
          enableCreate && (
            <Button key="new" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建
            </Button>
          ),
        ].filter(Boolean)}
      />

      {/* 新建/编辑弹窗 */}
      <Modal
        title={editingRecord ? editTitle : createTitle}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingRecord(null) }}
        confirmLoading={submitting}
        footer={null}
        destroyOnHidden
        width={600}
      >
        <ProForm
          key={editingRecord?.id || 'create'}
          initialValues={initialValues}
          onFinish={handleSubmit}
          submitter={{
            searchConfig: { submitText: editingRecord ? '保存' : '创建' },
            resetButtonProps: { style: { display: 'none' } },
          }}
        >
          {fields.map((field) => {
            const rules = field.rules || (field.name === 'name' || field.name === 'key'
              ? [{ required: true, message: `请输入${field.label}` }]
              : undefined)

            if (field.type === 'textarea') {
              return (
                <ProForm.Item key={field.name} name={field.name} label={field.label} rules={rules}>
                  <Input.TextArea rows={3} placeholder={field.placeholder} />
                </ProForm.Item>
              )
            }
            if (field.type === 'select') {
              return (
                <ProForm.Item key={field.name} name={field.name} label={field.label} rules={rules}>
                  <Select options={field.options} placeholder={field.placeholder} allowClear />
                </ProForm.Item>
              )
            }
            if (field.type === 'switch') {
              return (
                <ProForm.Item key={field.name} name={field.name} label={field.label} valuePropName="checked">
                  <Switch />
                </ProForm.Item>
              )
            }
            if (field.type === 'password') {
              return (
                <ProForm.Item key={field.name} name={field.name} label={field.label} rules={rules} extra={field.extra}>
                  <Input.Password placeholder={field.placeholder} />
                </ProForm.Item>
              )
            }
            if (field.type === 'number') {
              return (
                <ProForm.Item key={field.name} name={field.name} label={field.label} rules={rules}>
                  <InputNumber style={{ width: '100%' }} placeholder={field.placeholder} />
                </ProForm.Item>
              )
            }
            return (
              <ProForm.Item key={field.name} name={field.name} label={field.label} rules={rules} extra={field.extra}>
                <Input placeholder={field.placeholder} disabled={field.disabled} />
              </ProForm.Item>
            )
          })}
        </ProForm>
      </Modal>
    </>
  )
}
