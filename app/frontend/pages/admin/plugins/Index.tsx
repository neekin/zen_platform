import { PageContainer } from '@ant-design/pro-components'
import { App, Button, Card, Space, Tag, Typography, Empty, Popconfirm } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ApiOutlined } from '@ant-design/icons'
import { router } from '@inertiajs/react'
import AdminLayout from '@/layouts/AdminLayout'
import type { ReactNode } from 'react'

interface Plugin {
  name: string
  version: string
  description: string
  enabled: boolean
}

type Props = {
  plugins: Plugin[]
}

function PluginsIndex({ plugins }: Props) {
  const { message } = App.useApp()

  const handleInstall = (name: string) => {
    router.post(`/admin/plugins/${name}/install`, {}, {
      onSuccess: () => message.success('插件安装成功'),
      onError: (e) => message.error(typeof e === 'object' ? Object.values(e).flat().join(', ') : '安装失败'),
    })
  }

  const handleUninstall = (name: string) => {
    router.delete(`/admin/plugins/${name}/uninstall`, {
      onSuccess: () => message.success('插件已卸载'),
      onError: (e) => message.error(typeof e === 'object' ? Object.values(e).flat().join(', ') : '卸载失败'),
    })
  }

  const handleToggle = (name: string, enabled: boolean) => {
    const action = enabled ? 'disable' : 'enable'
    router.post(`/admin/plugins/${name}/${action}`, {
      onSuccess: () => message.success(enabled ? '插件已禁用' : '插件已启用'),
    })
  }

  // 已知的商业插件列表
  const knownPlugins = [
    { name: 'workflow', label: '工作流引擎', description: 'BPMN 工作流引擎 - 流程设计、审批、任务管理' },
  ]

  return (
    <PageContainer header={{ title: '插件管理' }}>
      <Typography.Paragraph type="secondary">
        管理已安装的插件。安装插件后即可使用对应功能。
      </Typography.Paragraph>

      {knownPlugins.map((kp) => {
        const installed = plugins.find((p) => p.name === kp.name)
        return (
          <Card key={kp.name} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  {kp.label}
                  {installed && (
                    <Tag color={installed.enabled ? 'green' : 'default'} style={{ marginLeft: 8 }}>
                      {installed.enabled ? '已启用' : '已安装'}
                    </Tag>
                  )}
                  {!installed && (
                    <Tag color="default" style={{ marginLeft: 8 }}>未安装</Tag>
                  )}
                </Typography.Title>
                <Typography.Paragraph type="secondary" style={{ margin: '4px 0 0' }}>
                  {kp.description}
                  {installed && <span> v{installed.version}</span>}
                </Typography.Paragraph>
              </div>
              <Space>
                {!installed ? (
                  <Button type="primary" icon={<ApiOutlined />} onClick={() => handleInstall(kp.name)}>
                    安装
                  </Button>
                ) : (
                  <>
                    <Button
                      type={installed.enabled ? 'default' : 'primary'}
                      icon={installed.enabled ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                      onClick={() => handleToggle(kp.name, installed.enabled)}
                    >
                      {installed.enabled ? '禁用' : '启用'}
                    </Button>
                    <Popconfirm title="确定要卸载此插件？" onConfirm={() => handleUninstall(kp.name)}>
                      <Button danger>卸载</Button>
                    </Popconfirm>
                  </>
                )}
              </Space>
            </div>
          </Card>
        )
      })}

      {plugins.filter((p) => !knownPlugins.find((kp) => kp.name === p.name)).length > 0 && (
        <Card title="其他已安装插件">
          {plugins.filter((p) => !knownPlugins.find((kp) => kp.name === p.name)).map((p) => (
            <div key={p.name} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <Space>
                <Tag>{p.name}</Tag>
                <Tag>v{p.version}</Tag>
                <Tag color={p.enabled ? 'green' : 'default'}>{p.enabled ? '启用' : '禁用'}</Tag>
              </Space>
            </div>
          ))}
        </Card>
      )}
    </PageContainer>
  )
}

PluginsIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default PluginsIndex
