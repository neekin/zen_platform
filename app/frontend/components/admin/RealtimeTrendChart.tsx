/**
 * 实时趋势图组件
 *
 * 使用 @ant-design/charts 的 Line 组件 + ActionCable 实时推送
 * 使用共享订阅，多个图表共用一个 WebSocket 连接
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
 * 2. 多个图表使用同一个 Channel，共享一个 WebSocket 连接
 *
 * ==============================================
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { Line } from '@ant-design/charts'
import { ProCard } from '@ant-design/pro-components'
import { Badge, Space, Typography, Spin } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import { useSharedSubscription } from '@/hooks/useSharedSubscription'

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
  /** 数据过滤函数（可选，用于不同图表显示不同数据） */
  filter?: (data: TrendDataPoint) => boolean
}

export default function RealtimeTrendChart({
  initialData = [],
  title = '实时数据趋势',
  yFieldLabel = '数值',
  color = '#D4A537',
  filter,
}: RealtimeTrendChartProps) {
  // 使用共享订阅
  const { data: rawData, connected } = useSharedSubscription(CHANNEL_NAME, MAX_DATA_POINTS)

  // 合并初始数据和实时数据
  const [displayData, setDisplayData] = useState<TrendDataPoint[]>(initialData)

  useEffect(() => {
    // 将实时数据转换为图表格式
    const realtimeData: TrendDataPoint[] = rawData
      .map((d: any) => ({
        time: d.time || new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        value: d.value || 0,
        category: d.category,
      }))
      .filter(d => filter ? filter(d) : true)

    // 合并初始数据和实时数据
    const merged = [...initialData, ...realtimeData]

    // 保持数据点数量在限制内
    setDisplayData(merged.slice(-MAX_DATA_POINTS))
  }, [rawData, initialData, filter])

  // 图表配置
  const chartConfig = {
    data: displayData,
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
        title ? (
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
        ) : undefined
      }
      variant="borderless"
      className="glass-card"
    >
      {displayData.length > 0 ? (
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
      {title && (
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
          实时数据通过 ActionCable 推送 · 多图表共享连接
        </div>
      )}
    </ProCard>
  )
}
