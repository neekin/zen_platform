import { useState, useEffect, useCallback, useRef } from 'react'
import { createConsumer } from '@rails/actioncable'

interface NotificationData {
  id: number
  action: string
  read: boolean
  actor?: { id: number; name: string }
  notifiable_type?: string
  notifiable_id?: number
  metadata?: string
  created_at: string
}

// 单例 Consumer，避免多个组件重复创建 WebSocket 连接
let consumer: ReturnType<typeof createConsumer> | null = null

function getCableUrl() {
  // 开发环境：连接到 Rails 服务器端口（非 Vite 端口）
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.hostname
  // Rails 服务器端口：从 meta tag 读取或使用默认 3100
  const port = document.querySelector<HTMLMetaElement>('meta[name="cable-port"]')?.content || '3100'
  return `${protocol}//${host}:${port}/cable`
}

function getConsumer() {
  if (!consumer) {
    consumer = createConsumer(getCableUrl())
  }
  return consumer
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [connected, setConnected] = useState(false)
  const subscriptionRef = useRef<ReturnType<typeof getConsumer.subscriptions.create> | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/admin/notifications.json', {
        headers: { 'Accept': 'application/json' },
        credentials: 'same-origin',
      })
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unread_count || 0)
      }
    } catch {
      // 静默失败
    }
  }, [])

  const markAsRead = useCallback(async (id: number) => {
    try {
      await fetch(`/admin/notifications/${id}/mark_as_read`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
        },
      })
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // 静默失败
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch('/admin/notifications/mark_all_as_read', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'X-CSRF-Token': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
        },
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      // 静默失败
    }
  }, [])

  useEffect(() => {
    // 先用 HTTP 拉取一次已有通知
    fetchNotifications()

    // 订阅 WebSocket 频道，接收实时推送
    const subscription = getConsumer().subscriptions.create(
      { channel: 'NotificationChannel' },
      {
        connected() {
          setConnected(true)
          // 连接成功后立即拉取一次最新通知
          fetchNotifications()
        },
        disconnected() {
          setConnected(false)
        },
        received(data: { type: string; notification: NotificationData }) {
          if (data.type === 'notification' && data.notification) {
            setNotifications((prev) => {
              // 去重：如果已存在则更新，否则插入到头部
              const exists = prev.some((n) => n.id === data.notification.id)
              if (exists) {
                return prev.map((n) => (n.id === data.notification.id ? data.notification : n))
              }
              return [data.notification, ...prev].slice(0, 50)
            })
            setUnreadCount((prev) => prev + 1)
          }
        },
      }
    )
    subscriptionRef.current = subscription

    return () => {
      subscription.unsubscribe()
      subscriptionRef.current = null
    }
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    connected,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  }
}
