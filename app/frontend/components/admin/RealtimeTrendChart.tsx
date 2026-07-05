/**
 * 实时趋势图组件
 *
 * 使用 @ant-design/charts 的 Line 组件 + ActionCable 实时推送
 *
 * ==============================================
 *  开发者指南：如何接入你的真实数据
 * ==============================================
 *
 * 1. 后端创建 Channel 推送数据：
 *
 *    # app/channels/dashboard_channel.rb
 *    class DashboardChannel < ApplicationCable::Channel
 *      def subscribed
 *        stream_from "dashboard_trend"
 *      end
 *    end
 *
 *    # 在你的业务逻辑中推送数据：
 *    ActionCable.server.broadcast("dashboard_trend", {
 *      time: Time.current.strftime("%H:%M:%S"),
 *      value: rand(100)
 *    })
 *
 * 2. 修改本组件的 handleNewData 方法处理你的数据格式
 *
 * 3. 修改 MAX_DATA_POINTS 控制显示的数据点数量
 *
 * ==============================================
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Line } from '@ant-design/charts'
import { ProCard } from '@ant-design/pro-components'
import { Badge, Space, Typography, Spin } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import { createConsumer } from '@rails/actioncable'
import type { Cable } from '@rails/actioncable'

const { Text } = Typography

// ============================================
// 配置区：根据你的需求修改
// ============================================

/** 最多显示的数据点数量 */
const MAX_DATA_POINTS = 50

/** Channel 名称 — 与后端 stream_from 一致 */
const CHANNEL_NAME = 'DashboardChannel'

/** 数据字段映射 — 根据你的后端数据格式修改 */
interface TrendDataPoint {
  time: string   // X 轴：时间
  value: number  // Y 轴：数值
  category?: string // 可选：分类（多条线时使用）
}

// ============================================
// 组件实现
// ============================================

interface RealtimeTrendChartProps {
  /** 初始数据（从后端 Inertia props 获取） */
  initialData?: TrendDataPoint[]
  /** 图表标题 */
  title?: string
  /** Y 轴字段名 */
  yFieldLabel?: string
  /** 图表颜色 */
  color?: string
}

export default function RealtimeTrendChart({
  initialData = [],
  title = '实时数据趋势',
  yFieldLabel = '数值',
  color = '#D4A537',
}: RealtimeTrendChartProps) {
  const [data, setData] = useState<TrendDataPoint[]>(initialData)
  const [connected, setConnected] = useState(false)

  // 使用 ref 追踪组件挂载状态，防止卸载后更新 state
  const isMountedRef = useRef(true)
  const consumerRef = useRef<Cable | null>(null)

  /**
   * ============================================
   *  入口 1: ActionCable 实时数据接收
   * ============================================
   *
   * 这里订阅 WebSocket Channel，接收后端推送的实时数据
   * 后端推送格式：{ time: "12:00:00", value: 42 }
   */
  useEffect(() => {
    // 标记组件已挂载
    isMountedRef.current = true

    // 获取 Rails 端口（开发环境 Vite 代理）
    const meta = document.querySelector<HTMLMetaElement>('meta[name="cable-port"]')
    const port = meta?.content || window.location.port
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const cableUrl = `${protocol}//${window.location.hostname}:${port}/cable`

    const consumer = createConsumer(cableUrl)
    consumerRef.current = consumer

    const subscription = consumer.subscriptions.create(CHANNEL_NAME, {
      connected() {
        // 检查组件是否仍然挂载
        if (isMountedRef.current) {
          console.log('[Dashboard] WebSocket 已连接')
          setConnected(true)
        }
      },

      disconnected() {
        if (isMountedRef.current) {
          console.log('[Dashboard] WebSocket 已断开')
          setConnected(false)
        }
      },

      /**
       * ============================================
       *  入口 2: 处理接收到的数据
       * ============================================
       *
       * 后端推送的数据会到达这里
       * 根据你的数据格式修改 handleNewData
       */
      received(newData: TrendDataPoint) {
        // 检查组件是否仍然挂载
        if (!isMountedRef.current) return

        handleNewData(newData)
      },
    })

    // 清理函数：组件卸载时断开连接
    return () => {
      isMountedRef.current = false
      subscription.unsubscribe()
      consumer.disconnect()
      consumerRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * ============================================
   *  入口 3: 数据处理逻辑
   * ============================================
   *
   * 处理从后端接收到的实时数据
   * 可以在这里添加数据转换、过滤、聚合等逻辑
   */
  const handleNewData = useCallback((newData: TrendDataPoint) => {
    setData(prev => {
      const updated = [...prev, newData]

      // 保持数据点数量在 MAX_DATA_POINTS 以内
      if (updated.length > MAX_DATA_POINTS) {
        return updated.slice(-MAX_DATA_POINTS)
      }

      return updated
    })
  }, [])

  // 图表配置
  const chartConfig = {
    data,
    xField: 'time',
    yField: 'value',
    height: 300,
    smooth: true,
    point: {
      size: 3,
      shape: 'circle' as const,
    },
    color,
    areaStyle: {
      fill: `${color}26`, // 15% 透明度
    },
    axis: {
      x: {
        labelAutoRotate: false,
        labelFormatter: (v: string) => v,
      },
      y: {
        title: yFieldLabel,
        min: 0,
      },
    },
    tooltip: {
      title: '时间',
      items: [{ name: yFieldLabel, field: 'value' }],
    },
  }

  return (
    <ProCard
      title={
        <Space>
          <span>{title}</span>
          <Badge
            status={connected ? 'success' : 'default'}
            text={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {connected ? '实时连接' : '未连接'}
              </Text>
            }
          />
        </Space>
      }
      variant="borderless"
      className="glass-card"
    >
      {data.length > 0 ? (
        <Line {...chartConfig} />
      ) : (
        <div
          style={{
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Space>
            <Spin size="small" />
            <Text type="secondary">等待数据...</Text>
          </Space>
        </div>
      )}

      {/* 开发提示 */}
      <div
        style={{
          marginTop: 12,
          padding: '8px 12px',
          background: 'rgba(0,0,0,0.02)',
          borderRadius: 6,
          fontSize: 12,
          color: 'var(--ant-color-text-tertiary)',
        }}
      >
        <ThunderboltOutlined style={{ marginRight: 4 }} />
        实时数据通过 ActionCable 推送 · 查看组件源码了解接入方式
      </div>
    </ProCard>
  )
}
