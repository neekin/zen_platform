/**
 * 重置密码页面
 * 路由: /admin/password/:token/edit
 */
import { useState } from 'react'
import { router } from '@inertiajs/react'
import { App, Form, Input, Button, Typography, Card } from 'antd'
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons'
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

type ResetPasswordProps = {
  token: string
}

export default function ResetPassword({ token }: ResetPasswordProps) {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (values: { password: string; password_confirmation: string }) => {
    if (values.password !== values.password_confirmation) {
      message.error('两次密码输入不一致')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/admin/password/${token}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          password: values.password,
          password_confirmation: values.password_confirmation,
        }),
      })
      const data = await res.json()
      if (data.code === 0) {
        setSuccess(true)
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
              重置密码
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
              {success ? '密码已重置' : '请输入新密码'}
            </Text>
          </div>

          {success ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 24 }}>
                <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
              </div>
              <Text style={{ color: 'rgba(255, 255, 255, 0.85)', display: 'block', marginBottom: 24 }}>
                密码已重置成功，请使用新密码登录
              </Text>
              <Button
                type="primary"
                onClick={() => router.visit('/admin/login')}
                style={{
                  background: 'linear-gradient(135deg, #F0D060 0%, #D4A537 50%, #A07F1E 100%)',
                  border: 'none',
                  color: '#1a1a1a',
                }}
              >
                前往登录
              </Button>
            </div>
          ) : (
            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少 6 位' },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="请输入新密码"
                  prefix={<LockOutlined style={{ color: 'rgba(255, 255, 255, 0.45)' }} />}
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>

              <Form.Item
                name="password_confirmation"
                rules={[{ required: true, message: '请确认新密码' }]}
              >
                <Input.Password
                  size="large"
                  placeholder="请再次输入新密码"
                  prefix={<LockOutlined style={{ color: 'rgba(255, 255, 255, 0.45)' }} />}
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
                  重置密码
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>
      </div>
    </ConfigProvider>
  )
}
