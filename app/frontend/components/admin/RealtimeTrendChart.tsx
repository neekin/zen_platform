/**
 * 实时趋势图组件
 *
 * 使用 @ant-design/charts 的 Line 组件 + ActionCable 实时推送
 * 单个 WebSocket 连接，通过 type 区分不同数据源
 *
 * ==============================================
 *  使用示例
 * ==============================================
 *
 * // 用户趋势（30秒间隔）
 * <RealtimeTrendChart type="trend" title="用户趋势" />
 *
 * // 订单统计（1分钟间隔）
 * <RealtimeTrendChart type="orders" title="订单统计" />
 *
 * // 收入统计（5分钟间隔）
 * <RealtimeTrendChart type="revenue" title="收入统计" color="#52c41a" />
 *
 * ==============================================
 */
import { useState, useEffect } from 'react'
import { Line } from '@ant-design/charts'
import { ProCard } from '@ant-design/pro-components'
import { Badge, Space, Typography, Spin } from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import { useSharedSubscription } from '@/hooks/useSharedSubscription'

const { Text } = Typography

const MAX_DATA_POINTS = 50

interface TrendDataPoint {
  time: string
  value: number
  type?: string
}

interface RealtimeTrendChartProps {
  /** 初始数据 */
  initialData?: TrendDataPoint[]
  /** 数据类型（trend/orders/revenue） */
  type?: string
  /** 图表标题 */
  title?: string
  /** Y 轴标签 */
  yFieldLabel?: string
  /** 图表颜色 */
  color?: string
}

export default function RealtimeTrendChart({
  initialData = [],
  type,
  title = '实时数据趋势',
  yFieldLabel = '数值',
  color = '#D4A537',
}: RealtimeTrendChartProps) {
  // 单个 Channel，按 type 过滤
  const { data: rawData, connected } = useSharedSubscription({ type, maxDataPoints: MAX_DATA_POINTS })

  const [displayData, setDisplayData] = useState<TrendDataPoint[]>(initialData)

  useEffect(() => {
    const realtimeData: TrendDataPoint[] = rawData.map((d: any) => ({
      time: d.time || new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      value: d.value || 0,
      type: d.type,
    }))

    const merged = [...initialData, ...realtimeData]
    setDisplayData(merged.slice(-MAX_DATA_POINTS))
  }, [rawData, initialData])

  const chartConfig = {
    data: displayData,
    xField: 'time',
    yField: 'value',
    height: 300,
    smooth: true,
    point: { size: 3, shape: 'circle' as const },
    color,
    areaStyle: { fill: `${color}26` },
    axis: {
      x: { labelAutoRotate: false },
      y: { title: yFieldLabel, min: 0 },
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
              text={<Text type="secondary" style={{ fontSize: 12 }}>{connected ? '实时连接' : '未连接'}</Text>}
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
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Space>
            <Spin size="small" />
            <Text type="secondary">等待数据...</Text>
          </Space>
        </div>
      )}

      {title && (
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(0,0,0,0.02)', borderRadius: 6, fontSize: 12, color: 'var(--ant-color-text-tertiary)' }}>
          <ThunderboltOutlined style={{ marginRight: 4 }} />
          单 Channel · 类型: {type || '全部'}
        </div>
      )}
    </ProCard>
  )
}
