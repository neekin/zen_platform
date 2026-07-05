/**
 * 大屏数据可视化页面
 *
 * 全屏展示实时数据，适合投屏/展示场景
 *
 * 功能：
 * - 实时趋势图
 * - 统计卡片
 * - 最近活动
 * - 自动刷新
 *
 * ==============================================
 *  开发者指南：自定义大屏内容
 * ==============================================
 *
 * 1. 修改 DashboardController#bigscreen 返回你的数据
 * 2. 修改本组件的布局和图表
 * 3. 添加更多 RealtimeTrendChart 实例展示不同指标
 *
 * ==============================================
 */
import { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Row, Col, Statistic, Space, Typography, Table, Badge } from 'antd'
import {
  UserOutlined,
  ArrowLeftOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import RealtimeTrendChart from '@/components/admin/RealtimeTrendChart'
import type { ReactNode } from 'react'

const { Text, Title } = Typography

interface StatItem {
  label: string
  value: number
  icon: string
  color?: string
}

interface ActivityItem {
  id: number
  event: string
  item_type: string
  item_id: number
  whodunnit: string | null
  created_at: string
}

interface BigScreenProps {
  stats: StatItem[]
  chart_data: Array<{ time: string; value: number }>
  recent_activities: ActivityItem[]
  framework: {
    name: string
    version: string
  }
}

const eventColors: Record<string, string> = {
  create: 'green',
  update: 'blue',
  destroy: 'red',
}

const eventLabels: Record<string, string> = {
  create: '创建',
  update: '更新',
  destroy: '删除',
}

export default function BigScreen({ stats, chart_data, recent_activities, framework }: BigScreenProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // 全屏切换
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // 监听全屏状态变化
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1f3e 50%, #0a0f1e 100%)',
        color: 'white',
        padding: '24px',
      }}
    >
      {/* 顶部导航 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          padding: '0 8px',
        }}
      >
        <Space>
          <img src="/logo-mark.svg" alt="Logo" style={{ width: 40 }} />
          <Title level={3} style={{ margin: 0, color: '#D4A537' }}>
            {framework.name}
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.5)' }}>v{framework.version}</Text>
        </Space>

        <Space size={16}>
          <Space>
            <ClockCircleOutlined style={{ color: 'rgba(255,255,255,0.65)' }} />
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontFamily: 'monospace' }}>
              {currentTime.toLocaleTimeString('zh-CN')}
            </Text>
          </Space>

          <div
            onClick={toggleFullscreen}
            style={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isFullscreen ? (
              <FullscreenExitOutlined style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18 }} />
            ) : (
              <FullscreenOutlined style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18 }} />
            )}
          </div>

          <div
            onClick={() => router.visit('/admin/dashboard')}
            style={{
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <ArrowLeftOutlined style={{ color: 'rgba(255,255,255,0.85)' }} />
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>返回</Text>
          </div>
        </Space>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col key={index} xs={24} sm={12} lg={Math.max(6, 24 / stats.length)}>
            <div
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '24px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.65)' }}>{stat.label}</span>}
                value={stat.value}
                valueStyle={{ color: stat.color || '#D4A537', fontSize: 36, fontWeight: 700 }}
              />
            </div>
          </Col>
        ))}
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '24px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: 600 }}>
                实时数据趋势
              </Text>
            </div>
            <RealtimeTrendChart
              initialData={chart_data}
              title=""
              yFieldLabel="数值"
              color="#D4A537"
            />
          </div>
        </Col>

        <Col xs={24} lg={8}>
          <div
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '24px',
              backdropFilter: 'blur(10px)',
              height: '100%',
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: 600 }}>
                最近活动
              </Text>
            </div>
            <Table
              size="small"
              dataSource={recent_activities}
              rowKey="id"
              pagination={false}
              style={{ background: 'transparent' }}
              columns={[
                {
                  title: '事件',
                  dataIndex: 'event',
                  width: 80,
                  render: (event: string) => (
                    <Badge color={eventColors[event] || 'default'} text={eventLabels[event] || event} />
                  ),
                },
                {
                  title: '对象',
                  dataIndex: 'item_type',
                  width: 100,
                  render: (type: string, record: any) => (
                    <span style={{ color: 'rgba(255,255,255,0.65)' }}>
                      {type} #{record.item_id}
                    </span>
                  ),
                },
                {
                  title: '时间',
                  dataIndex: 'created_at',
                  render: (time: string) => (
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                      {new Date(time).toLocaleString('zh-CN')}
                    </span>
                  ),
                },
              ]}
            />
          </div>
        </Col>
      </Row>

      {/* 底部信息 */}
      <div
        style={{
          textAlign: 'center',
          padding: '16px',
          color: 'rgba(255,255,255,0.3)',
          fontSize: 12,
        }}
      >
        {framework.name} v{framework.version} · 数据每 30 秒自动刷新
      </div>
    </div>
  )
}

// 大屏页面不使用 AdminLayout
BigScreen.layout = (page: ReactNode) => page
