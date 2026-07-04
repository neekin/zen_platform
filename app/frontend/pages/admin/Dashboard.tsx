import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components'
import { Row, Col, Space, Tag, Typography, Table, Badge } from 'antd'
import { Line } from '@ant-design/charts'
import {
  UserOutlined,
  FileTextOutlined,
  CommentOutlined,
  RiseOutlined,
  DatabaseOutlined,
} from '@ant-design/icons'
import AdminLayout from '@/layouts/AdminLayout'
import type { ReactNode } from 'react'

const { Link, Text } = Typography

Dashboard.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>

interface StatItem {
  label: string
  value: number
  icon: string
}

interface DashboardProps {
  stats: StatItem[]
  chart_data: Array<{ date: string; count: number }>
  recent_activities: Array<{
    id: number
    event: string
    item_type: string
    item_id: number
    whodunnit: string | null
    created_at: string
  }>
  framework: {
    name: string
    version: string
    rails_version: string
    ruby_version: string
  }
}

const iconMap: Record<string, ReactNode> = {
  user: <UserOutlined />,
  article: <FileTextOutlined />,
  comment: <CommentOutlined />,
  rise: <RiseOutlined />,
  database: <DatabaseOutlined />,
}

const iconColors: Record<string, string> = {
  user: 'var(--ant-color-primary)',
  article: '#52c41a',
  comment: '#faad14',
  rise: '#eb2f96',
  database: '#13c2c2',
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

export default function Dashboard({ stats, chart_data, recent_activities, framework }: DashboardProps) {
  const chartConfig = {
    data: chart_data,
    xField: 'date',
    yField: 'count',
    height: 250,
    smooth: true,
    point: { size: 3, shape: 'circle' as const },
    color: '#D4A537',
    areaStyle: { fill: 'rgba(212, 165, 55, 0.15)' },
    axis: {
      x: { labelAutoRotate: false, labelFormatter: (v: string) => v.slice(5) },
      y: { min: 0 },
    },
  }

  return (
    <PageContainer title="仪表盘" subTitle={`${framework.name} v${framework.version}`}>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col key={index} xs={24} sm={12} lg={Math.max(6, 24 / stats.length)}>
            <StatisticCard
              className="glass-card"
              statistic={{
                title: stat.label,
                value: stat.value,
                prefix: (
                  <span style={{ color: iconColors[stat.icon] || 'var(--ant-color-primary)' }}>
                    {iconMap[stat.icon] || <DatabaseOutlined />}
                  </span>
                ),
              }}
            />
          </Col>
        ))}
      </Row>

      {/* 图表 + 最近活动 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <ProCard title="数据趋势（近 30 天）" variant="borderless" className="glass-card">
            {chart_data.length > 0 ? (
              <Line {...chartConfig} />
            ) : (
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text type="secondary">暂无数据</Text>
              </div>
            )}
          </ProCard>
        </Col>
        <Col xs={24} lg={10}>
          <ProCard title="最近活动" variant="borderless" className="glass-card">
            <Table
              size="small"
              dataSource={recent_activities}
              rowKey="id"
              pagination={false}
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
                  render: (type: string, record: any) => `${type} #${record.item_id}`,
                },
                {
                  title: '时间',
                  dataIndex: 'created_at',
                  render: (time: string) => new Date(time).toLocaleString('zh-CN'),
                },
              ]}
            />
          </ProCard>
        </Col>
      </Row>

      {/* 快速开始 + 文档 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <ProCard title="快速开始" variant="borderless" className="glass-card">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <Tag color="blue">1</Tag>
                <Text>定义模型 DSL — 在模型中声明字段和展示配置</Text>
              </div>
              <div>
                <Tag color="blue">2</Tag>
                <Text>生成 CRUD — </Text>
                <Link href="https://zen.justfunit.net/scaffolding/admin" target="_blank">
                  rails generate zen:admin Post
                </Link>
              </div>
              <div>
                <Tag color="blue">3</Tag>
                <Text>生成 API — </Text>
                <Link href="https://zen.justfunit.net/scaffolding/api" target="_blank">
                  rails generate zen:api Post
                </Link>
              </div>
            </Space>
          </ProCard>
        </Col>
        <Col xs={24} lg={12}>
          <ProCard title="文档" variant="borderless" className="glass-card">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <Link href="https://zen.justfunit.net" target="_blank">使用文档</Link>
              <Link href="/api-docs">API 文档（Swagger）</Link>
              <Link href="https://github.com/neekin/zen_platform" target="_blank">GitHub 仓库</Link>
            </Space>
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  )
}
