/**
 * 个人中心页面
 * 路由: /admin/profile
 */
import { useState, useRef } from 'react'
import { router } from '@inertiajs/react'
import { PageContainer } from '@ant-design/pro-components'
import { App, Card, Form, Input, Button, Row, Col, Space, Divider, Typography, Avatar, Upload } from 'antd'
import { UserOutlined, LockOutlined, MobileOutlined, EditOutlined, SafetyOutlined, CameraOutlined } from '@ant-design/icons'
import AdminLayout from '@/layouts/AdminLayout'
import { useTranslation } from 'react-i18next'
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
  avatar: string | null
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
  const { t } = useTranslation()

  // 发送验证码
  const handleSendCode = async () => {
    const phone = phoneForm.getFieldValue('phone')
    if (!phone) {
      message.warning(t('profile.sendCodeFirst'))
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
        message.success(t('profile.codeSentToEmail'))
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
      message.error(t('login.sendFailed'))
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
        message.success(t('profile.phoneBound'))
        router.reload()
      } else {
        message.error(data.message)
      }
    } catch {
      message.error(t('profile.bindFailed'))
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
        message.success(t('profile.profileUpdated'))
        router.reload()
      } else {
        message.error(data.message)
      }
    } catch {
      message.error(t('profile.updateFailed'))
    } finally {
      setProfileLoading(false)
    }
  }

  // 修改密码
  const handleUpdatePassword = async (values: any) => {
    if (values.password !== values.password_confirmation) {
      message.error(t('profile.passwordMismatch'))
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
        message.success(t('profile.passwordUpdated'))
        passwordForm.resetFields()
      } else {
        message.error(data.message)
      }
    } catch {
      message.error(t('profile.updateFailed'))
    } finally {
      setPasswordLoading(false)
    }
  }

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const handleAvatarSelect = (info: any) => {
    const file = info.file
    if (!file) return

    // 验证文件类型
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
      message.error(t('profile.imageOnly'))
      return
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error(t('profile.imageSizeLimit'))
      return
    }

    // 生成预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
    setAvatarFile(file)
  }

  const handleAvatarSave = async () => {
    if (!avatarFile) return

    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', avatarFile)

      const res = await fetch('/admin/profile/avatar', {
        method: 'PATCH',
        headers: {
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: formData,
      })
      const data = await res.json()
      if (data.code === 0) {
        message.success(t('profile.avatarUpdated'))
        setAvatarPreview(null)
        setAvatarFile(null)
        router.reload()
      } else {
        message.error(data.message)
      }
    } catch {
      message.error(t('profile.uploadFailed'))
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleAvatarCancel = () => {
    setAvatarPreview(null)
    setAvatarFile(null)
  }

  return (
    <PageContainer title={t('profile.title')}>
      {/* 头像卡片 */}
      <Card variant="borderless" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            onChange={handleAvatarSelect}
            accept="image/*"
          >
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Avatar
                size={80}
                src={avatarPreview || user.avatar}
                icon={!avatarPreview && !user.avatar ? <UserOutlined /> : undefined}
                style={{ backgroundColor: (avatarPreview || user.avatar) ? 'transparent' : 'var(--ant-color-primary)' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'var(--ant-color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                }}
              >
                <CameraOutlined style={{ fontSize: 12, color: 'white' }} />
              </div>
            </div>
          </Upload>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{user.name || user.username}</div>
            <div style={{ color: 'var(--ant-color-text-secondary)' }}>{user.email}</div>
            {avatarPreview ? (
              <Space style={{ marginTop: 8 }}>
                <Button type="primary" size="small" onClick={handleAvatarSave} loading={avatarUploading}>
                  {t('profile.avatarSave')}
                </Button>
                <Button size="small" onClick={handleAvatarCancel}>
                  {t('profile.avatarCancel')}
                </Button>
              </Space>
            ) : (
              <div style={{ color: 'var(--ant-color-text-tertiary)', fontSize: 12, marginTop: 4 }}>{t('profile.changeAvatar')}</div>
            )}
          </div>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {/* 左侧：基本信息 + 手机绑定 */}
        <Col xs={24} lg={12}>
          {/* 基本信息 */}
          <Card title={t('profile.basicInfo')} variant="borderless">
            <Form
              form={profileForm}
              layout="vertical"
              initialValues={{
                name: user.name,
                note: user.note,
              }}
              onFinish={handleUpdateProfile}
            >
              <Form.Item label={t('profile.username')}>
                <Input value={user.username} disabled prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item label={t('profile.email')}>
                <Input value={user.email} disabled />
              </Form.Item>

              <Form.Item label={t('profile.name')} name="name">
                <Input placeholder={t('profile.namePlaceholder')} />
              </Form.Item>

              <Form.Item label={t('profile.note')} name="note">
                <TextArea rows={3} placeholder={t('profile.notePlaceholder')} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={profileLoading} icon={<EditOutlined />}>
                  {t('profile.saveChanges')}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* 手机绑定 */}
          <Card
            title={t('profile.phoneBinding')}
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
                      <Text type="success" style={{ fontSize: 12 }}>{t('profile.bound')}</Text>
                    </div>
                  </Space>
                  <Button type="link" onClick={() => setShowPhoneForm(true)}>
                    {t('profile.changePhone')}
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
                    <Text type="secondary">{t('profile.currentBinding')}: {user.phone}</Text>
                  </div>
                )}

                <Form.Item
                  label={t('profile.newPhone')}
                  name="phone"
                  validateTrigger={['onBlur']}
                  rules={[
                    { required: true, message: t('profile.enterPhone') },
                    { pattern: /^1[3-9]\d{9}$/, message: t('profile.phoneFormatError') },
                  ]}
                >
                  <Input placeholder={t('profile.enterPhone')} prefix={<MobileOutlined />} />
                </Form.Item>

                <Form.Item
                  label={t('profile.captcha')}
                  name="verification_code"
                  rules={[{ required: true, message: t('profile.enterCaptcha') }]}
                >
                  <Space.Compact style={{ width: '100%' }}>
                    <Input placeholder={t('profile.enterCaptcha')} prefix={<SafetyOutlined />} style={{ flex: 1 }} />
                    <Button
                      onClick={handleSendCode}
                      loading={codeSending}
                      disabled={countdown > 0}
                    >
                      {countdown > 0 ? t('profile.retryAfterSeconds', { count: countdown }) : t('profile.sendCaptcha')}
                    </Button>
                  </Space.Compact>
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={phoneLoading} icon={<MobileOutlined />}>
                      {user.phone ? t('profile.confirmChange') : t('profile.bindPhone')}
                    </Button>
                    {user.phone && (
                      <Button onClick={() => {
                        setShowPhoneForm(false)
                        phoneForm.resetFields()
                      }}>
                        {t('common.cancel')}
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
          <Card title={t('profile.changePassword')} variant="borderless">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleUpdatePassword}
            >
              <Form.Item
                label={t('profile.currentPassword')}
                name="current_password"
                rules={[{ required: true, message: t('profile.enterCurrentPassword') }]}
              >
                <Input.Password placeholder={t('profile.enterCurrentPassword')} prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                label={t('profile.newPassword')}
                name="password"
                rules={[
                  { required: true, message: t('profile.enterNewPassword') },
                  { min: 6, message: t('profile.passwordMinLength') },
                ]}
              >
                <Input.Password placeholder={t('profile.enterNewPassword')} prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                label={t('profile.confirmNewPassword')}
                name="password_confirmation"
                rules={[{ required: true, message: t('profile.enterConfirmPassword') }]}
              >
                <Input.Password placeholder={t('profile.confirmNewPasswordPlaceholder')} prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={passwordLoading} icon={<LockOutlined />}>
                  {t('profile.changePassword')}
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* 账号信息 */}
          <Card title={t('profile.accountInfo')} variant="borderless" style={{ marginTop: 16 }}>
            <Space orientation="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <Text type="secondary">{t('profile.username')}</Text>
                <div>{user.username}</div>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Text type="secondary">{t('profile.email')}</Text>
                <div>{user.email}</div>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Text type="secondary">{t('profile.phone')}</Text>
                <div>{user.phone || t('profile.unbound')}</div>
              </div>
              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Text type="secondary">{t('profile.registeredAt')}</Text>
                <div>{new Date(user.created_at).toLocaleDateString()}</div>
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
