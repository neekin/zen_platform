import { PageContainer, StatisticCard } from '@ant-design/pro-components'
import { Col, Row, Card, Table, Tag, Space } from 'antd'
import {
  UserOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  MoneyCollectOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import AdminLayout from '../../layouts/AdminLayout'
import type { ReactNode } from 'react'

Dashboard.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>

const recentActivity = [
  {
    key: '1',
    user: '张三',
    action: '创建了新订单',
    time: '2 分钟前',
    status: 'success',
  },
  {
    key: '2',
    user: '李四',
    action: '更新了用户信息',
    time: '10 分钟前',
    status: 'processing',
  },
  {
    key: '3',
    user: '王五',
    action: '删除了文章',
    time: '1 小时前',
    status: 'error',
  },
  {
    key: '4',
    user: '赵六',
    action: '发布了评论',
    time: '2 小时前',
    status: 'success',
  },
]

const columns = [
  {
    title: '用户',
    dataIndex: 'user',
    key: 'user',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
  },
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      const colorMap: Record<string, string> = {
        success: 'green',
        processing: 'blue',
        error: 'red',
      }
      return <Tag color={colorMap[status]}>{status}</Tag>
    },
  },
]

export default function Dashboard() {
  return (
    <PageContainer
      title="仪表盘"
      subTitle="欢迎回来，Admin"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            className="glass-card"
            statistic={{
              title: '用户总数',
              value: 1286,
              prefix: <UserOutlined style={{ color: '#1677FF' }} />,
              description: (
                <Space>
                  <span style={{ color: '#52c41a' }}>
                    <ArrowUpOutlined /> 12.5%
                  </span>
                  <span>较昨日</span>
                </Space>
              ),
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            className="glass-card"
            statistic={{
              title: '订单数量',
              value: 356,
              prefix: <ShoppingCartOutlined style={{ color: '#1677FF' }} />,
              description: (
                <Space>
                  <span style={{ color: '#52c41a' }}>
                    <ArrowUpOutlined /> 8.2%
                  </span>
                  <span>较昨日</span>
                </Space>
              ),
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            className="glass-card"
            statistic={{
              title: '文章数量',
              value: 89,
              prefix: <FileTextOutlined style={{ color: '#1677FF' }} />,
              description: (
                <Space>
                  <span style={{ color: '#ff4d4f' }}>
                    <ArrowDownOutlined /> 2.1%
                  </span>
                  <span>较昨日</span>
                </Space>
              ),
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            className="glass-card"
            statistic={{
              title: '总收入',
              value: 128956,
              prefix: <MoneyCollectOutlined style={{ color: '#1677FF' }} />,
              description: (
                <Space>
                  <span style={{ color: '#52c41a' }}>
                    <ArrowUpOutlined /> 15.3%
                  </span>
                  <span>较昨日</span>
                </Space>
              ),
            }}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="最近活动" bordered={false} className="glass-card">
            <Table
              columns={columns}
              dataSource={recentActivity}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="快速操作" bordered={false} className="glass-card">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(100, 140, 200, 0.1)' }}>
                <a href="/admin/users" style={{ color: '#1677FF' }}>管理用户</a>
              </div>
              <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(100, 140, 200, 0.1)' }}>
                <a href="/admin/settings" style={{ color: '#1677FF' }}>系统设置</a>
              </div>
              <div style={{ padding: '12px 0' }}>
                <a href="/admin/logs" style={{ color: '#1677FF' }}>查看日志</a>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  )
}
