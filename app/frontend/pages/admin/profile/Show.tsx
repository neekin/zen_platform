/**
 * 个人中心页面
 * 路由: /admin/profile
 */
import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { PageContainer } from '@ant-design/pro-components'
import { App, Card, Form, Input, Button, Row, Col, Space, Divider, Typography } from 'antd'
import { UserOutlined, LockOutlined, PhoneOutlined, EditOutlined } from '@ant-design/icons'
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
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

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
        {/* 基本信息 */}
        <Col xs={24} lg={12}>
          <Card title="基本信息" variant="borderless">
            <Form
              form={profileForm}
              layout="vertical"
              initialValues={{
                name: user.name,
                phone: user.phone,
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

              <Form.Item label="手机号码" name="phone">
                <Input placeholder="请输入手机号码" prefix={<PhoneOutlined />} />
              </Form.Item>

              <Form.Item label="备注" name="note">
                <TextArea rows={4} placeholder="添加备注信息..." />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={profileLoading} icon={<EditOutlined />}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 修改密码 */}
        <Col xs={24} lg={12}>
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
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
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
