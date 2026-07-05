/**
 * 共享 ActionCable 订阅管理器
 *
 * 解决问题：多个图表组件各自订阅 WebSocket 会创建多个连接
 * 方案：一个共享连接，多个订阅者
 *
 * ==============================================
 *  使用方式
 * ==============================================
 *
 * // 在组件中使用
 * import { useSharedSubscription } from '@/hooks/useSharedSubscription'
 *
 * function MyChart() {
 *   const { data, connected } = useSharedSubscription('DashboardChannel')
 *   // data 是最新收到的消息
 * }
 *
 * ==============================================
 */
import { useEffect, useRef, useCallback, useState } from 'react'
import { createConsumer } from '@rails/actioncable'
import type { Cable, Channel } from '@rails/actioncable'

// 全局共享的 consumer 实例
let globalConsumer: Cable | null = null

// 订阅者管理
interface SubscriptionEntry {
  channel: Channel
  subscribers: Set<(data: any) => void>
  data: any[]
}

const subscriptions = new Map<string, SubscriptionEntry>()

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
 * 订阅 Channel（如果已存在则复用）
 */
function subscribe(channelName: string, onData: (data: any) => void): () => void {
  let entry = subscriptions.get(channelName)

  if (!entry) {
    // 创建新订阅
    const consumer = getConsumer()
    const subscribers = new Set<(data: any) => void>()

    const channel = consumer.subscriptions.create(channelName, {
      received(data: any) {
        // 保存数据
        entry!.data = [...entry!.data.slice(-99), data] // 保留最近 100 条

        // 通知所有订阅者
        subscribers.forEach(callback => callback(data))
      },
    })

    entry = { channel, subscribers, data: [] }
    subscriptions.set(channelName, entry)
  }

  // 添加订阅者
  entry.subscribers.add(onData)

  // 返回取消订阅函数
  return () => {
    entry!.subscribers.delete(onData)

    // 如果没有订阅者了，取消订阅
    if (entry!.subscribers.size === 0) {
      entry!.channel.unsubscribe()
      subscriptions.delete(channelName)
    }
  }
}

/**
 * Hook：使用共享订阅
 *
 * @param channelName Channel 名称
 * @param maxDataPoints 最大数据点数
 */
export function useSharedSubscription(channelName: string, maxDataPoints = 50) {
  const [data, setData] = useState<any[]>([])
  const [connected, setConnected] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    const handleData = (newData: any) => {
      if (!isMountedRef.current) return

      setData(prev => {
        const updated = [...prev, newData]
        return updated.length > maxDataPoints
          ? updated.slice(-maxDataPoints)
          : updated
      })
    }

    const unsubscribe = subscribe(channelName, handleData)

    // 模拟连接状态（实际状态需要从 channel 获取）
    setConnected(true)

    return () => {
      isMountedRef.current = false
      unsubscribe()
      setConnected(false)
    }
  }, [channelName, maxDataPoints])

  return { data, connected }
}

/**
 * 获取订阅统计信息（调试用）
 */
export function getSubscriptionStats() {
  const stats: Record<string, number> = {}
  subscriptions.forEach((entry, name) => {
    stats[name] = entry.subscribers.size
  })
  return stats
}
