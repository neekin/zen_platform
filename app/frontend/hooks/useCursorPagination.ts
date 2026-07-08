import { useState, useCallback, useRef } from 'react'
import { router } from '@inertiajs/react'

export interface CursorPaginationMeta {
  has_more: boolean
  next_cursor: string | null
  per_page: number
  pagination_type: 'cursor'
}

export interface UseCursorPaginationOptions<T> {
  /** 基础 API 路径 */
  basePath: string
  /** 每页数量 */
  perPage?: number
  /** 排序字段 */
  sortField?: string
  /** 排序方向 */
  sortDir?: 'asc' | 'desc'
  /** 是否启用虚拟滚动 */
  virtual?: boolean
  /** 数据转换函数 */
  transform?: (data: any) => { records: T[]; meta: CursorPaginationMeta }
}

export function useCursorPagination<T extends { id: number | string }>({
  basePath,
  perPage = 50,
  sortField = 'id',
  sortDir = 'asc',
  virtual = false,
  transform,
}: UseCursorPaginationOptions<T>) {
  const [data, setData] = useState<T[]>([])
  const [meta, setMeta] = useState<CursorPaginationMeta>({
    has_more: false,
    next_cursor: null,
    per_page: perPage,
    pagination_type: 'cursor',
  })
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const initialized = useRef(false)

  // 初始化加载（第一页）
  const loadInitial = useCallback(() => {
    if (initialized.current) return

    setLoading(true)
    initialized.current = true

    const params = new URLSearchParams({
      per_page: String(perPage),
      sort: sortField,
      sort_dir: sortDir,
      virtual: String(virtual),
    })

    // 使用 Inertia 访问
    router.visit(`${basePath}?${params.toString()}`, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: (page) => {
        // 从 props 中获取数据
        const result = transform ? transform(page.props) : page.props
        setData(result.records)
        setMeta(result.meta)
        setLoading(false)
      },
      onError: () => {
        setLoading(false)
      },
    })
  }, [basePath, perPage, sortField, sortDir, virtual, transform])

  // 加载更多（游标分页）
  const loadMore = useCallback(
    (cursor: string) => {
      if (loadingMore) return

      setLoadingMore(true)

      const params = new URLSearchParams({
        per_page: String(perPage),
        sort: sortField,
        sort_dir: sortDir,
        cursor: cursor,
        cursor_direction: 'after',
      })

      // 使用 fetch 获取更多数据（避免页面刷新）
      fetch(`${basePath}?${params.toString()}`, {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
        .then((res) => res.json())
        .then((result) => {
          const transformed = transform ? transform(result) : result
          setData((prev) => [...prev, ...transformed.records])
          setMeta(transformed.meta)
          setLoadingMore(false)
        })
        .catch(() => {
          setLoadingMore(false)
        })
    },
    [basePath, perPage, sortField, sortDir, loadingMore, transform]
  )

  // 重置数据
  const reset = useCallback(() => {
    setData([])
    setMeta({
      has_more: false,
      next_cursor: null,
      per_page: perPage,
      pagination_type: 'cursor',
    })
    initialized.current = false
  }, [perPage])

  return {
    data,
    meta,
    loading,
    loadingMore,
    loadInitial,
    loadMore,
    reset,
    setData,
    cursorPagination: {
      hasMore: meta.has_more,
      nextCursor: meta.next_cursor,
      onLoadMore: loadMore,
      loadingMore,
    },
  }
}
