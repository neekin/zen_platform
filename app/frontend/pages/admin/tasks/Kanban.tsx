/**
 * Task 看板视图
 * 路由: /admin/tasks
 *
 * 支持拖拽排序、分组显示，Modal 创建/编辑
 */
import { useState, useCallback } from 'react'
import { router, usePage } from '@inertiajs/react'
import { PageContainer, ProForm, ProFormText, ProFormTextArea, ProFormSelect } from '@ant-design/pro-components'
import { App, Button } from 'antd'
import { PlusOutlined, UnorderedListOutlined } from '@ant-design/icons'
import AdminLayout from '../../../layouts/AdminLayout'
import KanbanBoard from '../../../modules/admin/components/products/KanbanBoard'
import DslModal from '../../../modules/dsl/DslModal'
import type { KanbanColumn, KanbanCard } from '../../../modules/admin/components/products/KanbanBoard'
import type { DslMeta } from '../../../types/dsl'
import type { ReactNode } from 'react'

interface TaskKanbanProps {
  meta: DslMeta
  tasks: Record<string, any>[]
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'todo', title: 'Todo', color: '#1890ff' },
  { id: 'doing', title: 'Doing', color: '#52c41a' },
  { id: 'done', title: 'Done', color: '#faad14' },
]

function TaskKanban({ meta, tasks }: TaskKanbanProps) {
  const { message } = App.useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Record<string, any> | null>(null)

  const cards: KanbanCard[] = tasks.map((item) => ({
    id: item.id,
    title: item.title,
    columnId: item.status,
    ...item,
  }))

  const handleCardClick = useCallback((card: KanbanCard) => {
    const task = tasks.find((t) => t.id === card.id)
    if (task) {
      setEditing(task)
      setModalOpen(true)
    }
  }, [tasks])

  const handleCardMove = useCallback(
    (cardId: string | number, _fromColumn: string, toColumn: string) => {
      router.put(`/admin/tasks/${cardId}`, { status: toColumn }, {
        onSuccess: () => { message.success('移动成功'); router.reload() },
      })
    },
    [],
  )

  const handleAddCard = useCallback((_columnId: string) => {
    setEditing(null)
    setModalOpen(true)
  }, [])

  const handleFinish = async (values: Record<string, any>) => {
    if (editing) {
      router.put(`/admin/tasks/${editing.id}`, values, {
        onSuccess: () => { message.success('更新成功'); setModalOpen(false); router.reload() },
      })
    } else {
      router.post('/admin/tasks', values, {
        onSuccess: () => { message.success('创建成功'); setModalOpen(false); router.reload() },
      })
    }
    return true
  }

  return (
    <PageContainer
      title="任务看板"
      extra={[
        <Button key="list" icon={<UnorderedListOutlined />} onClick={() => router.visit('/admin/tasks')}>
          列表视图
        </Button>,
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAddCard}>
          新建
        </Button>,
      ]}
    >
      <KanbanBoard
        columns={KANBAN_COLUMNS}
        cards={cards}
        onCardClick={handleCardClick}
        onCardMove={handleCardMove}
        onAddCard={handleAddCard}
      />

      <DslModal
        title={editing ? '编辑任务' : '新建任务'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnHidden
        width={600}
      >
        <ProForm
          initialValues={editing || { status: 'todo' }}
          onFinish={handleFinish}
          submitter={{
            searchConfig: { submitText: editing ? '更新' : '创建' },
            resetButtonProps: { style: { display: 'none' } },
          }}
        >
          <ProFormText name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]} />
          <ProFormSelect
            name="status"
            label="状态"
            options={[
              { label: 'Todo', value: 'todo' },
              { label: 'Doing', value: 'doing' },
              { label: 'Done', value: 'done' },
            ]}
          />
          <ProFormTextArea name="description" label="描述" />
        </ProForm>
      </DslModal>
    </PageContainer>
  )
}

TaskKanban.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default TaskKanban
