import { useEffect, useState, useCallback } from 'react'
import { Skeleton, Tag, Space, Button, Spin, Alert, Pagination } from 'antd'
import { DownOutlined, ReloadOutlined } from '@ant-design/icons'
import { useLazyAssociation } from '@/hooks/useLazyAssociation'

type LazyAssociationProps = {
  /** 资源 ID */
  resourceId: number | string
  /** 关联名称 */
  associationName: string
  /** 关联类型 */
  associationType: 'belongs_to' | 'has_many'
  /** 初始数据（如 ID 或 {_lazy: true} 标记） */
  initialData?: any
  /** 基础 URL（默认空，使用相对路径） */
  baseUrl?: string
  /** 自定义渲染 belongs_to 数据 */
  renderBelongsTo?: (data: any) => React.ReactNode
  /** 自定义渲染 has_many 单项 */
  renderHasManyItem?: (item: any, index: number) => React.ReactNode
  /** 是否自动加载（默认 false，需点击触发） */
  autoLoad?: boolean
  /** 标签文本 */
  label?: string
}

/**
 * 懒加载关联数据组件
 *
 * belongs_to: 显示 ID，点击加载详情
 * has_many: 显示计数/展开按钮，点击分页加载
 */
export default function LazyAssociation({
  resourceId,
  associationName,
  associationType,
  initialData,
  baseUrl = '',
  renderBelongsTo,
  renderHasManyItem,
  autoLoad = false,
  label,
}: LazyAssociationProps) {
  const { state, load, loadMore, reset } = useLazyAssociation({
    resourceId,
    associationName,
    baseUrl,
  })
  const [expanded, setExpanded] = useState(false)

  // 自动加载
  useEffect(() => {
    if (autoLoad && !state.loaded && !state.loading) {
      load()
    }
  }, [autoLoad, state.loaded, state.loading, load])

  const handleExpand = useCallback(() => {
    if (!state.loaded && !state.loading) {
      load()
    }
    setExpanded(prev => !prev)
  }, [state.loaded, state.loading, load])

  // belongs_to 模式
  if (associationType === 'belongs_to') {
    return (
      <LazyBelongsTo
        state={state}
        initialData={initialData}
        load={load}
        renderBelongsTo={renderBelongsTo}
        label={label}
      />
    )
  }

  // has_many 模式
  return (
    <LazyHasMany
      state={state}
      expanded={expanded}
      onExpand={handleExpand}
      loadMore={loadMore}
      reset={reset}
      renderHasManyItem={renderHasManyItem}
      label={label}
      initialCount={initialData}
    />
  )
}

/** belongs_to 懒加载子组件 */
function LazyBelongsTo({
  state,
  initialData,
  load,
  renderBelongsTo,
  label,
}: {
  state: any
  initialData?: any
  load: () => void
  renderBelongsTo?: (data: any) => React.ReactNode
  label?: string
}) {
  // 已加载完成
  if (state.loaded && state.data) {
    if (renderBelongsTo) {
      return <>{renderBelongsTo(state.data)}</>
    }
    return (
      <Space>
        <Tag color="blue">{state.data.name || state.data.id}</Tag>
        <Button
          type="link"
          size="small"
          icon={<ReloadOutlined />}
          onClick={() => load()}
        >
          刷新
        </Button>
      </Space>
    )
  }

  // 加载中
  if (state.loading) {
    return <Skeleton.Input active size="small" style={{ width: 120 }} />
  }

  // 加载失败
  if (state.error) {
    return (
      <Space>
        <Alert
          type="error"
          message={state.error}
          banner
          style={{ padding: '2px 8px' }}
        />
        <Button type="link" size="small" onClick={() => load()}>
          重试
        </Button>
      </Space>
    )
  }

  // 初始状态：显示 ID，点击加载
  const id = initialData?.id || initialData
  return (
    <Space>
      <Tag>{label || associationName}: {id ?? '-'}</Tag>
      <Button type="link" size="small" onClick={() => load()}>
        加载详情
      </Button>
    </Space>
  )
}

/** has_many 懒加载子组件 */
function LazyHasMany({
  state,
  expanded,
  onExpand,
  loadMore,
  reset,
  renderHasManyItem,
  label,
  initialCount,
}: {
  state: any
  expanded: boolean
  onExpand: () => void
  loadMore: () => void
  reset: () => void
  renderHasManyItem?: (item: any, index: number) => React.ReactNode
  label?: string
  initialCount?: number
}) {
  const count = state.meta?.total ?? initialCount ?? 0

  return (
    <div>
      <Space>
        <Tag>{label || associationName}</Tag>
        <span style={{ color: 'var(--ant-color-text-secondary)', fontSize: 12 }}>
          ({count} 项)
        </span>
        <Button
          type="link"
          size="small"
          icon={<DownOutlined style={{ transform: expanded ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }} />}
          onClick={onExpand}
        >
          {expanded ? '收起' : '展开'}
        </Button>
      </Space>

      {expanded && (
        <div style={{ marginTop: 8, paddingLeft: 16 }}>
          {state.loading && !state.loaded ? (
            <div style={{ padding: '8px 0' }}>
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          ) : state.error ? (
            <Space>
              <Alert
                type="error"
                message={state.error}
                banner
                style={{ padding: '2px 8px' }}
              />
              <Button type="link" size="small" onClick={() => onExpand()}>
                重试
              </Button>
            </Space>
          ) : state.loaded && Array.isArray(state.data) ? (
            <>
              {state.data.length === 0 ? (
                <span style={{ color: 'var(--ant-color-text-tertiary)' }}>暂无数据</span>
              ) : (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {state.data.map((item: any, index: number) =>
                    renderHasManyItem ? (
                      <div key={item.id || index}>{renderHasManyItem(item, index)}</div>
                    ) : (
                      <Tag key={item.id || index}>{item.name || item.id}</Tag>
                    )
                  )}
                </Space>
              )}

              {state.meta && state.meta.total_pages > 1 && (
                <div style={{ marginTop: 8, textAlign: 'right' }}>
                  <Pagination
                    size="small"
                    current={state.meta.page}
                    pageSize={state.meta.per_page}
                    total={state.meta.total}
                    onChange={(page) => {
                      // 翻页重新加载
                      reset()
                      // 通过 load 传入 page 参数
                      const searchParams = new URLSearchParams({
                        name: '',
                        page: String(page),
                        per_page: String(state.meta.per_page),
                      })
                      // 使用 loadMore 的分页逻辑
                      loadMore()
                    }}
                    showSizeChanger={false}
                    showTotal={(total) => `共 ${total} 项`}
                  />
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}
