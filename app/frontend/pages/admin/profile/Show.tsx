/**
 * 个人中心页面
 * 路由: /admin/profile
 */
import { useState, useRef } from 'react'
import { router } from '@inertiajs/react'
import { PageContainer } from '@ant-design/pro-components'
import { App, Card, Form, Input, Button, Row, Col, Space, Divider, Typography, Statistic } from 'antd'
import { UserOutlined, LockOutlined, MobileOutlined, EditOutlined, SafetyOutlined } from '@ant-design/icons'
import AdminLayout from '@/layouts/AdminLayout'
import type { ReactNode } from 'react'

const { TextArea } = Input
const { Text } = Typography

interface UserProfile {
  id: number
  username: string
  email: string
  name: string
  phone: string | null
  note: string | null
  created_at: string
}

function ProfileShow({ user }: { user: UserProfile }) {
  const { message } = App.useApp()
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [phoneForm] = Form.useForm()
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [codeSending, setCodeSending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [showPhoneForm, setShowPhoneForm] = useState(!user.phone)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 发送验证码
  const handleSendCode = async () => {
    const phone = phoneForm.getFieldValue('phone')
    if (!phone) {
      message.warning('请先输入手机号码')
      return
    }

    setCodeSending(true)
    try {
      const res = await fetch('/admin/profile/send_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ purpose: 'bind_phone' }),
      })
      const data = await res.json()
      if (data.code === 0) {
        message.success('验证码已发送到邮箱，请查看控制台')
        // 开始倒计时
        setCountdown(60)
        timerRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              if (timerRef.current) clearInterval(timerRef.current)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        message.error(data.message)
      }
    } catch {
      message.error('发送失败')
    } finally {
      setCodeSending(false)
    }
  }

  // 绑定手机号码
  const handleBindPhone = async (values: any) => {
    setPhoneLoading(true)
    try {
      const res = await fetch('/admin/profile/bind_phone', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          phone: values.phone,
          verification_code: values.verification_code,
        }),
      })
      const data = await res.json()
      if (data.code === 0) {
        message.success('手机号码已绑定')
        router.reload()
      } else {
        message.error(data.message)
      }
    } catch {
      message.error('绑定失败')
    } finally {
      setPhoneLoading(false)
    }
  }

  // 更新个人信息
  const handleUpdateProfile = async (values: any) => {
    setProfileLoading(true)
    try {
      const res = await fetch('/admin/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (data.code === 0) {
        message.success('个人信息已更新')
        router.reload()
      } else {
        message.error(data.message)
      }
    } catch {
      message.error('更新失败')
    } finally {
      setProfileLoading(false)
    }
  }

  // 修改密码
  const handleUpdatePassword = async (values: any) => {
    if (values.password !== values.password_confirmation) {
      message.error('两次密码输入不一致')
      return
    }

    setPasswordLoading(true)
    try {
      const res = await fetch('/admin/profile/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          current_password: values.current_password,
          password: values.password,
        }),
      })
      const data = await res.json()
      if (data.code === 0) {
        message.success('密码已更新')
        passwordForm.resetFields()
      } else {
        message.error(data.message)
      }
    } catch {
      message.error('更新失败')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <PageContainer title="个人中心">
      <Row gutter={[16, 16]}>
        {/* 左侧：基本信息 + 手机绑定 */}
        <Col xs={24} lg={12}>
          {/* 基本信息 */}
          <Card title="基本信息" variant="borderless">
            <Form
              form={profileForm}
              layout="vertical"
              initialValues={{
                name: user.name,
                note: user.note,
              }}
              onFinish={handleUpdateProfile}
            >
              <Form.Item label="用户名">
                <Input value={user.username} disabled prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item label="邮箱">
                <Input value={user.email} disabled />
              </Form.Item>

              <Form.Item label="姓名" name="name">
                <Input placeholder="请输入姓名" />
              </Form.Item>

              <Form.Item label="备注" name="note">
                <TextArea rows={3} placeholder="添加备注信息..." />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={profileLoading} icon={<EditOutlined />}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* 手机绑定 */}
          <Card
            title="手机绑定"
            variant="borderless"
            style={{ marginTop: 16 }}
          >
            {user.phone && !showPhoneForm ? (
              /* 已绑定状态 */
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Space>
                    <MobileOutlined style={{ fontSize: 24, color: 'var(--ant-color-primary)' }} />
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 500 }}>{user.phone}</div>
                      <Text type="success" style={{ fontSize: 12 }}>已绑定</Text>
                    </div>
                  </Space>
                  <Button type="link" onClick={() => setShowPhoneForm(true)}>
                    更换手机号码
                  </Button>
                </div>
              </div>
            ) : (
              /* 绑定/更换表单 */
              <Form
                form={phoneForm}
                layout="vertical"
                onFinish={handleBindPhone}
              >
                {user.phone && (
                  <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">当前绑定: {user.phone}</Text>
                  </div>
                )}

                <Form.Item
                  label="新手机号码"
                  name="phone"
                  rules={[
                    { required: true, message: '请输入手机号码' },
                    { pattern: /^1[3-9]\d{9}$/, message: '手机号码格式不正确' },
                  ]}
                >
                  <Input placeholder="请输入手机号码" prefix={<MobileOutlined />} />
                </Form.Item>

                <Form.Item
                  label="验证码"
                  name="verification_code"
                  rules={[{ required: true, message: '请输入验证码' }]}
                >
                  <Space.Compact style={{ width: '100%' }}>
                    <Input placeholder="请输入验证码" prefix={<SafetyOutlined />} style={{ flex: 1 }} />
                    <Button
                      onClick={handleSendCode}
                      loading={codeSending}
                      disabled={countdown > 0}
                    >
                      {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
                    </Button>
                  </Space.Compact>
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={phoneLoading} icon={<MobileOutlined />}>
                      {user.phone ? '确认更换' : '绑定手机号码'}
                    </Button>
                    {user.phone && (
                      <Button onClick={() => {
                        setShowPhoneForm(false)
                        phoneForm.resetFields()
                      }}>
                        取消
                      </Button>
                    )}
                  </Space>
                </Form.Item>
              </Form>
            )}
          </Card>
        </Col>

        {/* 右侧：修改密码 + 账号信息 */}
        <Col xs={24} lg={12}>
          {/* 修改密码 */}
          <Card title="修改密码" variant="borderless">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleUpdatePassword}
            >
              <Form.Item
                label="当前密码"
                name="current_password"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password placeholder="请输入当前密码" prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                label="新密码"
                name="password"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少 6 位' },
                ]}
              >
                <Input.Password placeholder="请输入新密码" prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                label="确认新密码"
                name="password_confirmation"
                rules={[{ required: true, message: '请确认新密码' }]}
              >
                <Input.Password placeholder="请再次输入新密码" prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={passwordLoading} icon={<LockOutlined />}>
                  修改密码
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* 账号信息 */}
          <Card title="账号信息" variant="borderless" style={{ marginTop: 16 }}>
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <Text type="secondary">用户名</Text>
                <div>{user.username}</div>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Text type="secondary">邮箱</Text>
                <div>{user.email}</div>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Text type="secondary">手机号码</Text>
                <div>{user.phone || '未绑定'}</div>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Text type="secondary">注册时间</Text>
                <div>{new Date(user.created_at).toLocaleDateString('zh-CN')}</div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  )
}

ProfileShow.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default ProfileShow
