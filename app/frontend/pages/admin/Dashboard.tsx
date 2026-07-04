import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components'
import { Row, Col, Space, Tag, Typography } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  ApiOutlined,
  CodeOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import AdminLayout from '../../layouts/AdminLayout'
import type { ReactNode } from 'react'

const { Link, Text } = Typography

Dashboard.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>

interface DashboardProps {
  stats: {
    user_count: number
    role_count: number
  }
  framework: {
    name: string
    version: string
    rails_version: string
    ruby_version: string
  }
}

const features = [
  { icon: <CodeOutlined />, title: 'Model DSL', desc: '声明式定义字段、关联和展示配置' },
  { icon: <ThunderboltOutlined />, title: '脚手架生成', desc: '一键生成 CRUD 控制器、前端页面和路由' },
  { icon: <SafetyCertificateOutlined />, title: 'RBAC 权限', desc: 'Pundit + Rolify 四级角色权限控制' },
  { icon: <AuditOutlined />, title: '审计日志', desc: 'PaperTrail 全量变更追踪与数据还原' },
  { icon: <ApiOutlined />, title: 'REST API', desc: 'JWT 认证 + rswag 自动生成文档' },
  { icon: <FileTextOutlined />, title: '富文本编辑器', desc: 'Lexical 插件化架构，支持自定义' },
]

export default function Dashboard({ stats, framework }: DashboardProps) {
  return (
    <PageContainer
      title="仪表盘"
      subTitle={`${framework.name} v${framework.version}`}
    >
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            className="glass-card"
            statistic={{
              title: '用户总数',
              value: stats.user_count,
              prefix: <UserOutlined style={{ color: 'var(--ant-color-primary)' }} />,
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            className="glass-card"
            statistic={{
              title: '角色数量',
              value: stats.role_count,
              prefix: <TeamOutlined style={{ color: 'var(--ant-color-primary)' }} />,
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            className="glass-card"
            statistic={{
              title: 'Rails 版本',
              value: framework.rails_version,
              prefix: <ThunderboltOutlined style={{ color: 'var(--ant-color-success)' }} />,
            }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            className="glass-card"
            statistic={{
              title: 'Ruby 版本',
              value: framework.ruby_version,
              prefix: <CodeOutlined style={{ color: 'var(--ant-color-warning)' }} />,
            }}
          />
        </Col>
      </Row>

      {/* 框架特性 */}
      <ProCard
        title="框架特性"
        variant="borderless"
        className="glass-card"
        style={{ marginTop: 16 }}
      >
        <Row gutter={[16, 16]}>
          {features.map((f) => (
            <Col xs={24} sm={12} lg={8} key={f.title}>
              <ProCard
                variant="borderless"
                style={{ background: 'transparent' }}
              >
                <Space align="start" size={12}>
                  <div style={{ fontSize: 24, color: 'var(--ant-color-primary)' }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{f.title}</div>
                    <Text type="secondary" style={{ fontSize: 13 }}>{f.desc}</Text>
                  </div>
                </Space>
              </ProCard>
            </Col>
          ))}
        </Row>
      </ProCard>

      {/* 快速开始 */}
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
                <Link href="https://neekin.github.io/zen_platform/scaffolding/admin" target="_blank">
                  rails generate zen:admin Post
                </Link>
              </div>
              <div>
                <Tag color="blue">3</Tag>
                <Text>生成 API — </Text>
                <Link href="https://neekin.github.io/zen_platform/scaffolding/api" target="_blank">
                  rails generate zen:api Post
                </Link>
              </div>
              <div>
                <Tag color="blue">4</Tag>
                <Text>配置权限 — 在系统设置中管理角色和权限</Text>
              </div>
            </Space>
          </ProCard>
        </Col>
        <Col xs={24} lg={12}>
          <ProCard title="文档" variant="borderless" className="glass-card">
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <Link href="https://neekin.github.io/zen_platform/" target="_blank">
                  完整文档
                </Link>
                <Text type="secondary"> — 安装、配置、DSL、脚手架、API、部署</Text>
              </div>
              <div>
                <Link href="https://neekin.github.io/zen_platform/dsl/" target="_blank">
                  Model DSL
                </Link>
                <Text type="secondary"> — 字段定义、关联、展示配置</Text>
              </div>
              <div>
                <Link href="https://neekin.github.io/zen_platform/scaffolding/" target="_blank">
                  脚手架生成器
                </Link>
                <Text type="secondary"> — Admin CRUD 和 API 自动生成</Text>
              </div>
              <div>
                <Link href="https://github.com/neekin/zen_platform" target="_blank">
                  GitHub 仓库
                </Link>
                <Text type="secondary"> — 源码、Issues、贡献指南</Text>
              </div>
            </Space>
          </ProCard>
        </Col>
      </Row>
    </PageContainer>
  )
}
