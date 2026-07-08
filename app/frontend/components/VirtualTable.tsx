import { useRef, useCallback, useMemo } from 'react'
import { TableVirtuoso, TableVirtuosoHandle } from 'react-virtuoso'
import { ProTable, type ProColumns, type ProTableProps } from '@ant-design/pro-components'
import { Spin, Empty } from 'antd'

export type VirtualTableProps<T = any> = {
  /** 数据源 */
  dataSource: T[]
  /** 列定义 */
  columns: ProColumns<T>[]
  /** 行高（固定行高模式） */
  rowHeight?: number
  /** 是否启用虚拟滚动 */
  virtual?: boolean
  /** 表格高度 */
  height?: number
  /** 加载状态 */
  loading?: boolean
  /** 游标分页配置 */
  cursorPagination?: {
    hasMore: boolean
    nextCursor: string | null
    onLoadMore: (cursor: string) => void
    loadingMore: boolean
  }
  /** 其他 ProTable 属性 */
  tableProps?: Omit<ProTableProps<T>, 'dataSource' | 'columns'>
}

export default function VirtualTable<T extends Record<string, any>>({
  dataSource,
  columns,
  rowHeight = 54,
  virtual = false,
  height = 600,
  loading = false,
  cursorPagination,
  tableProps = {},
}: VirtualTableProps<T>) {
  const virtuosoRef = useRef<TableVirtuosoHandle>(null)

  // 游标分页加载更多
  const handleEndReached = useCallback(() => {
    if (cursorPagination?.hasMore && !cursorPagination.loadingMore && cursorPagination.nextCursor) {
      cursorPagination.onLoadMore(cursorPagination.nextCursor)
    }
  }, [cursorPagination])

  // 虚拟滚动模式
  if (virtual && dataSource.length > 1000) {
    return (
      <div style={{ height, border: '1px solid var(--ant-color-border)', borderRadius: 8 }}>
        <TableVirtuoso
          ref={virtuosoRef}
          data={dataSource}
          endReached={handleEndReached}
          overscan={200}
          fixedHeaderContent={() => (
            <tr>
              {columns.map((col, index) => (
                <th
                  key={col.key || index}
                  style={{
                    width: col.width,
                    minWidth: col.width,
                    padding: '16px',
                    background: 'var(--ant-color-bg-layout)',
                    borderBottom: '1px solid var(--ant-color-border)',
                    fontWeight: 600,
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  {col.title as React.ReactNode}
                </th>
              ))}
            </tr>
          )}
          itemContent={(index, record) => (
            <>
              {columns.map((col, colIndex) => {
                const value = record[col.dataIndex as string]
                return (
                  <td
                    key={col.key || colIndex}
                    style={{
                      width: col.width,
                      minWidth: col.width,
                      padding: '16px',
                      borderBottom: '1px solid var(--ant-color-border)',
                    }}
                  >
                    {col.render ? col.render(value, record, index) : value}
                  </td>
                )
              })}
            </>
          )}
          components={{
            Table: (props) => (
              <table
                {...props}
                style={{
                  ...props.style,
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              />
            ),
            TableRow: (props) => (
              <tr
                {...props}
                style={{
                  ...props.style,
                  height: rowHeight,
                }}
              />
            ),
            EmptyPlaceholder: () => (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '48px 0' }}>
                  <Empty description="暂无数据" />
                </td>
              </tr>
            ),
            Footer: () =>
              cursorPagination?.loadingMore ? (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: 'center', padding: '16px' }}>
                    <Spin tip="加载中..." />
                  </td>
                </tr>
              ) : null,
          }}
        />
      </div>
    )
  }

  // 传统 ProTable 模式（数据量小时）
  return (
    <ProTable
      dataSource={dataSource}
      columns={columns}
      loading={loading}
      pagination={dataSource.length > 50 ? { defaultPageSize: 20, showSizeChanger: true } : false}
      {...tableProps}
    />
  )
}
