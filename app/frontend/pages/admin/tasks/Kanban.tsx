/**
 * Task 看板视图
 * 路由: /admin/tasks
 *
 * 支持拖拽排序、分组显示
 */
import { useCallback } from 'react'
import { router } from '@inertiajs/react'
import { PageContainer } from '@ant-design/pro-components'
import { App, Button } from 'antd'
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

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'todo', title: 'Todo', color: '#1890ff' },
  { id: 'doing', title: 'Doing', color: '#52c41a' },
  { id: 'done', title: 'Done', color: '#faad14' },
]

interface TaskKanbanProps {
  tasks: Task[]
}

function TaskKanban({ tasks }: TaskKanbanProps) {
  const { message } = App.useApp()

  const cards: KanbanCard[] = tasks.map((item) => ({
    id: item.id,
    title: item.title,
    columnId: item.status,
    ...item,
  }))

  const handleCardClick = useCallback((card: KanbanCard) => {
    router.visit(`/admin/tasks/${card.id}`)
  }, [])

  const handleCardMove = useCallback(
    (cardId: string | number, _fromColumn: string, toColumn: string) => {
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

  const handleAddCard = useCallback((_columnId: string) => {
    router.visit('/admin/tasks/new')
  }, [])

  return (
    <PageContainer
      title="任务看板"
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
