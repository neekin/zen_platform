/**
 * 忘记密码页面
 * 路由: /admin/password/new
 */
import { useState } from 'react'
import { router } from '@inertiajs/react'
import { App, Form, Input, Button, Typography, Card } from 'antd'
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { ConfigProvider } from 'antd'

const { Title, Text } = Typography

const loginDarkTheme = {
  token: {
    colorPrimary: '#D4A537',
    colorBgContainer: 'rgba(255, 255, 255, 0.08)',
    colorBgElevated: 'rgba(255, 255, 255, 0.12)',
    colorText: 'rgba(255, 255, 255, 0.9)',
    colorTextPlaceholder: 'rgba(255, 255, 255, 0.4)',
    colorBorder: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  },
}

export default function ForgotPassword() {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true)
    try {
      const res = await fetch('/admin/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ email: values.email }),
      })
      const data = await res.json()
      if (data.code === 0) {
        setSent(true)
        message.success(data.message)
      } else {
        message.error(data.message)
      }
    } catch {
      message.error('请求失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfigProvider theme={loginDarkTheme}>
      <div style={{
        backgroundColor: '#0a0f1e',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Card
          style={{
            width: 400,
            backgroundColor: 'rgba(15, 20, 35, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 12,
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img src="/logo-mark.svg" alt="Logo" style={{ width: 60, marginBottom: 16 }} />
            <Title level={4} style={{ color: 'rgba(255, 255, 255, 0.95)', margin: 0 }}>
              忘记密码
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
              {sent ? '重置链接已发送' : '输入注册邮箱，获取密码重置链接'}
            </Text>
          </div>

          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 24 }}>
                <MailOutlined style={{ fontSize: 48, color: '#52c41a' }} />
              </div>
              <Text style={{ color: 'rgba(255, 255, 255, 0.85)', display: 'block', marginBottom: 8 }}>
                重置链接已发送到您的邮箱
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.45)', display: 'block', marginBottom: 24 }}>
                请查看控制台获取链接（有效期 2 小时）
              </Text>
              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.visit('/admin/login')}
                style={{
                  background: 'linear-gradient(135deg, #F0D060 0%, #D4A537 50%, #A07F1E 100%)',
                  border: 'none',
                  color: '#1a1a1a',
                }}
              >
                返回登录
              </Button>
            </div>
          ) : (
            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '邮箱格式不正确' },
                ]}
              >
                <Input
                  size="large"
                  placeholder="请输入注册邮箱"
                  prefix={<MailOutlined style={{ color: 'rgba(255, 255, 255, 0.45)' }} />}
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  style={{
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #F0D060 0%, #D4A537 50%, #A07F1E 100%)',
                    border: 'none',
                    fontWeight: 600,
                    color: '#1a1a1a',
                  }}
                >
                  发送重置链接
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center' }}>
                <Button
                  type="link"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.visit('/admin/login')}
                  style={{ color: 'rgba(240, 208, 96, 0.85)' }}
                >
                  返回登录
                </Button>
              </div>
            </Form>
          )}
        </Card>
      </div>
    </ConfigProvider>
  )
}
