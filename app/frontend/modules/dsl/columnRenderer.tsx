import type { ProColumns } from '@ant-design/pro-components'
import { router } from '@inertiajs/react'
import { Tag, Image } from 'antd'
import type { DslMeta, ListColumn } from '@/types/dsl'

/**
 * 根据 DSL 元数据构建 ProTable 列定义
 */
export function buildColumns(meta: DslMeta, basePath: string): ProColumns[] {
  const columns: ListColumn[] = meta.display.list?.columns || []
  return columns.map((col) => buildColumn(col, meta, basePath))
}

function buildColumn(col: ListColumn, meta: DslMeta, basePath: string): ProColumns {
  const fieldDef = meta.fields[col.name]
  const fieldName = fieldDef?.name || col.name

  const column: ProColumns = {
    title: fieldName,
    dataIndex: col.display ? [col.display, 'name'] : fieldName,
    key: fieldName,
    width: col.width,
  }

  if (col.link) {
    column.render = (_: any, record: any) => (
      <a onClick={() => router.visit(`${basePath}/${record.id}`)}>{record[fieldName]}</a>
    )
    return column
  }

  if (col.badge) {
    column.render = (_: any, record: any) => {
      const val = record[fieldName]
      const colors: Record<string, string> = {
        draft: 'default', published: 'green', archived: 'red',
        active: 'green', inactive: 'orange',
        todo: 'blue', doing: 'processing', done: 'success',
      }
      return <Tag color={colors[val] || 'default'}>{val}</Tag>
    }
    return column
  }

  if (col.format === 'relative_time') {
    column.render = (_: any, record: any) => {
      const val = record[fieldName]
      if (!val) return '-'
      const d = new Date(val)
      const now = new Date()
      const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
      if (diff < 60) return '刚刚'
      if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
      if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
      return d.toLocaleDateString('zh-CN')
    }
    return column
  }

  if (col.format === 'currency') {
    column.render = (_: any, record: any) => {
      const val = record[fieldName]
      return val != null ? `¥${Number(val).toFixed(2)}` : '-'
    }
    return column
  }

  if (col.thumbnail) {
    column.render = (_: any, record: any) => (
      record[fieldName]
        ? <Image src={record[fieldName]} width={60} height={60} style={{ objectFit: 'cover' }} />
        : <span style={{ color: 'var(--ant-color-text-tertiary)' }}>-</span>
    )
    return column
  }

  if (col.display) {
    column.dataIndex = [fieldName, col.display]
    return column
  }

  return column
}
