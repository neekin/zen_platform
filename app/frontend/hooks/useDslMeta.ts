import { useState, useEffect } from 'react'
import type { DslMeta } from '@/types/dsl'

interface UseDslMetaOptions {
  /** 如果已有 meta（从 Inertia prop 传入），直接使用 */
  initial?: DslMeta
  /** 模型名称，用于从 API 获取 */
  model?: string
}

/**
 * 获取 DSL 元数据的 hook
 * 优先使用 Inertia prop 传入的 meta，否则从 API 获取
 */
export function useDslMeta({ initial, model }: UseDslMetaOptions) {
  const [meta, setMeta] = useState<DslMeta | null>(initial ?? null)
  const [loading, setLoading] = useState(!initial && !!model)

  useEffect(() => {
    if (initial || !model) return

    setLoading(true)
    fetch(`/api/v1/meta/${model}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.code === 0) {
          setMeta(json.data)
        }
      })
      .finally(() => setLoading(false))
  }, [initial, model])

  return { meta, loading }
}
