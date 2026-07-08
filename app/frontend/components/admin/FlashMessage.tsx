/**
 * Flash 消息组件
 *
 * 监听 Inertia 共享的 flash 消息并显示
 */
import { useEffect, useRef } from 'react'
import { usePage } from '@inertiajs/react'
import { App } from 'antd'

export default function FlashMessage() {
  const { notification } = App.useApp()
  const { flash } = usePage().props
  const lastTs = useRef<number>(0)

  useEffect(() => {
    if (!flash?.ts || flash.ts === lastTs.current) return
    lastTs.current = flash.ts

    if (flash.notice) {
      notification.success({
        title: '成功',
        description: flash.notice,
        placement: 'bottomRight',
        duration: 3,
      })
    }

    if (flash.alert) {
      notification.error({
        title: '错误',
        description: flash.alert,
        placement: 'bottomRight',
        duration: 4,
      })
    }
  }, [flash?.ts])

  return null
}
