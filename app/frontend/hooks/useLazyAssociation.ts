import { useState, useCallback, useRef } from 'react'

interface LazyAssociationState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
  loaded: boolean
  meta?: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

interface UseLazyAssociationOptions {
  baseUrl?: string
}

/**
 * 懒加载关联数据 hook
 *
 * 用法：
 * const { state, load, loadMore } = useLazyAssociation({
 *   resourceId: 1,
 *   associationName: 'roles',
 * })
 */
export function useLazyAssociation({
  resourceId,
  associationName,
  baseUrl = '',
  options = {},
}: {
  resourceId: number | string
  associationName: string
  baseUrl?: string
  options?: UseLazyAssociationOptions
}) {
  const [state, setState] = useState<LazyAssociationState>({
    data: null,
    loading: false,
    error: null,
    loaded: false,
  })

  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(async (params?: Record<string, any>) => {
    // 取消之前的请求
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const searchParams = new URLSearchParams({
        name: associationName,
        ...(params || {}),
      })

      const url = `${baseUrl}/admin/users/${resourceId}/association_data?${searchParams}`
      const resp = await fetch(url, {
        signal: abortRef.current.signal,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      if (!resp.ok) {
        throw new Error(`请求失败: ${resp.status}`)
      }

      const json = await resp.json()

      if (json.code !== 0) {
        throw new Error(json.message || '加载失败')
      }

      setState({
        data: json.data,
        loading: false,
        error: null,
        loaded: true,
        meta: json.meta,
      })

      return json
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || '加载失败',
      }))
    }
  }, [resourceId, associationName, baseUrl])

  const loadMore = useCallback(async () => {
    if (!state.meta || state.meta.page >= state.meta.total_pages) return

    const searchParams = new URLSearchParams({
      name: associationName,
      page: String(state.meta.page + 1),
      per_page: String(state.meta.per_page),
    })

    try {
      const url = `${baseUrl}/admin/users/${resourceId}/association_data?${searchParams}`
      const resp = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })

      if (!resp.ok) throw new Error(`请求失败: ${resp.status}`)
      const json = await resp.json()
      if (json.code !== 0) throw new Error(json.message || '加载失败')

      setState(prev => ({
        data: Array.isArray(prev.data)
          ? [...prev.data, ...(json.data || [])]
          : json.data,
        loading: false,
        error: null,
        loaded: true,
        meta: json.meta,
      }))
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || '加载更多失败',
      }))
    }
  }, [resourceId, associationName, baseUrl, state.meta])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, loaded: false })
  }, [])

  return { state, load, loadMore, reset }
}
