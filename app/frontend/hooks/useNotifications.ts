import { useState, useEffect, useCallback, useRef } from 'react'
import { router } from '@inertiajs/react'

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

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)

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
      // Silent fail
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
      // Silent fail
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
      // Silent fail
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  }
}
