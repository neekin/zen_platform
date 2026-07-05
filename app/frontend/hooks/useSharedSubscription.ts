/**
 * 共享 ActionCable 订阅管理器
 *
 * 单个 Channel，通过 type 字段区分不同数据源
 *
 * ==============================================
 *  使用方式
 * ==============================================
 *
 * // 订阅用户趋势
 * const { data, connected } = useSharedSubscription({ type: 'trend' })
 *
 * // 订阅订单统计
 * const { data, connected } = useSharedSubscription({ type: 'orders' })
 *
 * // 订阅所有数据
 * const { data, connected } = useSharedSubscription()
 *
 * ==============================================
 */
import { useEffect, useRef, useState } from 'react'
import { createConsumer } from '@rails/actioncable'
import type { Cable, Channel } from '@rails/actioncable'

// 全局共享的 consumer 实例
let globalConsumer: Cable | null = null

// 单个 Channel 的订阅者管理
interface SubscriptionEntry {
  channel: Channel
  subscribers: Map<string, (data: any) => void>
  data: any[]
}

let mainSubscription: SubscriptionEntry | null = null
const CHANNEL_NAME = 'DashboardChannel'

/**
 * 获取或创建全局 consumer
 */
function getConsumer(): Cable {
  if (!globalConsumer) {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="cable-port"]')
    const port = meta?.content || window.location.port
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const cableUrl = `${protocol}//${window.location.hostname}:${port}/cable`
    globalConsumer = createConsumer(cableUrl)
  }
  return globalConsumer
}

/**
 * 确保 Channel 订阅存在
 */
function ensureSubscription(): SubscriptionEntry {
  if (!mainSubscription) {
    const consumer = getConsumer()
    const subscribers = new Map<string, (data: any) => void>()

    const channel = consumer.subscriptions.create(CHANNEL_NAME, {
      received(data: any) {
        // 保存数据
        mainSubscription!.data = [...mainSubscription!.data.slice(-99), data]
        // 通知所有订阅者
        subscribers.forEach(callback => callback(data))
      },
    })

    mainSubscription = { channel, subscribers, data: [] }
  }

  return mainSubscription
}

/**
 * 订阅（带可选的 type 过滤）
 */
function subscribe(
  subscriberId: string,
  onData: (data: any) => void
): () => void {
  const entry = ensureSubscription()
  entry.subscribers.set(subscriberId, onData)

  return () => {
    entry.subscribers.delete(subscriberId)
    // 无订阅者时断开连接
    if (entry.subscribers.size === 0) {
      entry.channel.unsubscribe()
      mainSubscription = null
    }
  }
}

interface UseSharedSubscriptionOptions {
  /** 过滤数据类型（如 'trend', 'orders', 'revenue'） */
  type?: string
  /** 最大数据点数 */
  maxDataPoints?: number
}

/**
 * Hook：使用共享订阅
 */
export function useSharedSubscription(options: UseSharedSubscriptionOptions = {}) {
  const { type, maxDataPoints = 50 } = options
  const [data, setData] = useState<any[]>([])
  const [connected, setConnected] = useState(false)
  const isMountedRef = useRef(true)
  const subscriberIdRef = useRef(`sub-${Math.random().toString(36).slice(2, 9)}`)

  useEffect(() => {
    isMountedRef.current = true

    const handleData = (newData: any) => {
      if (!isMountedRef.current) return

      // 如果指定了类型，只处理匹配的数据
      if (type && newData.type !== type) return

      setData(prev => {
        const updated = [...prev, newData]
        return updated.length > maxDataPoints
          ? updated.slice(-maxDataPoints)
          : updated
      })
    }

    const unsubscribe = subscribe(subscriberIdRef.current, handleData)
    setConnected(true)

    return () => {
      isMountedRef.current = false
      unsubscribe()
      setConnected(false)
    }
  }, [type, maxDataPoints])

  return { data, connected }
}

/**
 * 获取订阅统计信息（调试用）
 */
export function getSubscriptionStats() {
  if (!mainSubscription) return { subscribers: 0, dataPoints: 0 }
  return {
    subscribers: mainSubscription.subscribers.size,
    dataPoints: mainSubscription.data.length,
  }
}
