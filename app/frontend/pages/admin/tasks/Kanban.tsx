/**
 * Task 看板视图
 * 路由: /admin/tasks
 *
 * 支持拖拽排序、分组显示
 */
import { useState, useCallback } from 'react'
import { router } from '@inertiajs/react'
import { PageContainer } from '@ant-design/pro-components'
import { App, Button, Modal, message } from 'antd'
import { PlusOutlined, UnorderedListOutlined } from '@ant-design/icons'
import AdminLayout from '../../../layouts/AdminLayout'
import KanbanBoard from '../../../modules/admin/components/products/KanbanBoard'
import type { KanbanColumn, KanbanCard } from '../../../modules/admin/components/products/KanbanBoard'
import type { ReactNode } from 'react'

interface Task {
  id: number
  title: string
  status: string
  created_at: string
  updated_at: string
}

// 看板列配置
const KANBAN_COLUMNS: KanbanColumn[] = [

  { id: 'todo', title: 'Todo', color: '#1890ff' },

  { id: 'doing', title: 'Doing', color: '#52c41a' },

  { id: 'done', title: 'Done', color: '#faad14' },

]

interface TaskKanbanProps {
  tasks: Task[]

}

function TaskKanban({ tasks, ...props }: TaskKanbanProps) {
  const { message } = App.useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)

  // 将数据转换为看板卡片格式
  const cards: KanbanCard[] = tasks.map((item) => ({
    id: item.id,
    title: item.title,

    columnId: item.status,

    ...item,
  }))

  // 卡片点击
  const handleCardClick = useCallback((card: KanbanCard) => {
    setEditing(card as any)
    setModalOpen(true)
  }, [])

  // 卡片拖拽移动
  const handleCardMove = useCallback(
    (cardId: string | number, fromColumn: string, toColumn: string) => {
      // 更新卡片的分组字段
      router.put(`/admin/tasks/${cardId}`, {
        status: toColumn,
      }, {
        onSuccess: () => {
          message.success('移动成功')
          router.reload()
        },
      })
    },
    [],
  )

  // 新增卡片
  const handleAddCard = useCallback((columnId: string) => {
    // 可以打开新增弹窗，或者直接跳转
    router.visit('/admin/tasks/new')
  }, [])

  return (
    <PageContainer
      title="Task看板"
      extra={[
        <Button
          key="list"
          icon={<UnorderedListOutlined />}
          onClick={() => router.visit('/admin/tasks')}
        >
          列表视图
        </Button>,
        <Button
          key="add"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.visit('/admin/tasks/new')}
        >
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
    </PageContainer>
  )
}

TaskKanban.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default TaskKanban
