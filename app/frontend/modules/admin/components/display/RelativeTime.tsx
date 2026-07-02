/**
 * 相对时间组件
 *
 * 显示相对时间（如：3分钟前、2小时前）
 */
import { useState, useEffect } from 'react'
import { Tooltip } from 'antd'

export interface RelativeTimeProps {
  /** 时间值（ISO 字符串或时间戳） */
  value: string | number
  /** 是否显示完整时间（hover 时） */
  showFullTime?: boolean
  /** 自定义样式 */
  style?: React.CSSProperties
}

// 时间单位常量
const TIME_UNITS = [
  { unit: '年', value: 365 * 24 * 60 * 60 * 1000 },
  { unit: '个月', value: 30 * 24 * 60 * 60 * 1000 },
  { unit: '天', value: 24 * 60 * 60 * 1000 },
  { unit: '小时', value: 60 * 60 * 1000 },
  { unit: '分钟', value: 60 * 1000 },
  { unit: '秒', value: 1000 },
]

// 计算相对时间
function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 0) {
    return '刚刚'
  }

  for (const { unit, value } of TIME_UNITS) {
    const count = Math.floor(diff / value)
    if (count >= 1) {
      return `${count}${unit}前`
    }
  }

  return '刚刚'
}

// 格式化完整时间
function formatFullTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function RelativeTime({
  value,
  showFullTime = true,
  style,
}: RelativeTimeProps) {
  const [relativeTime, setRelativeTime] = useState('')

  useEffect(() => {
    const timestamp = typeof value === 'string' ? new Date(value).getTime() : value
    setRelativeTime(getRelativeTime(timestamp))

    // 每分钟更新一次
    const timer = setInterval(() => {
      setRelativeTime(getRelativeTime(timestamp))
    }, 60 * 1000)

    return () => clearInterval(timer)
  }, [value])

  const timestamp = typeof value === 'string' ? new Date(value).getTime() : value
  const fullTime = formatFullTime(timestamp)

  if (showFullTime) {
    return (
      <Tooltip title={fullTime}>
        <span style={{ color: 'var(--ant-color-text-secondary)', ...style }}>
          {relativeTime}
        </span>
      </Tooltip>
    )
  }

  return (
    <span style={{ color: 'var(--ant-color-text-secondary)', ...style }}>
      {relativeTime}
    </span>
  )
}
