import {
  LockOutlined,
  MobileOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  LoginFormPage,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components'
import { router, usePage } from '@inertiajs/react'
import { App, Button, ConfigProvider, Divider, Space, Tabs } from 'antd'
import { useEffect, useState } from 'react'
import type { SharedProps } from '@/types'

type LoginType = 'phone' | 'account'

// 登录页深色玻璃容器主题：让输入框/Tabs 适配半透明深色背景
const loginDarkTheme = {
  token: {
    colorPrimary: '#D4A537',
    colorBgContainer: 'rgba(255, 255, 255, 0.08)',
    colorBgElevated: 'rgba(255, 255, 255, 0.12)',
    colorText: 'rgba(255, 255, 255, 0.9)',
    colorTextPlaceholder: 'rgba(255, 255, 255, 0.4)',
    colorBorder: 'rgba(255, 255, 255, 0.15)',
    colorBorderSecondary: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  components: {
    Input: {
      colorBgContainer: 'rgba(255, 255, 255, 0.08)',
      activeShadow: '0 0 0 2px rgba(212, 165, 55, 0.2)',
    },
    Tabs: {
      itemColor: 'rgba(255, 255, 255, 0.65)',
      itemSelectedColor: '#F0D060',
      itemHoverColor: 'rgba(255, 255, 255, 0.85)',
      inkBarColor: '#D4A537',
    },
    Checkbox: {
      colorPrimary: '#D4A537',
      colorText: 'rgba(255, 255, 255, 0.65)',
    },
  },
}

const Page = () => {
  const { notification } = App.useApp()
  const [loginType, setLoginType] = useState<LoginType>('account')
  const [loading, setLoading] = useState(false)
  const [phoneValue, setPhoneValue] = useState('')
  const { flash } = usePage<SharedProps>().props

  useEffect(() => {
    if (flash?.alert) {
      notification.open({
        type: 'error',
        title: '登录失败',
        description: flash.alert,
        placement: 'bottomRight',
      })
    }
    if (flash?.notice) {
      notification.open({
        type: 'success',
        title: flash.notice,
        placement: 'bottomRight',
      })
    }
  }, [flash?.ts])

  return (
    <ConfigProvider theme={loginDarkTheme}>
      <div style={{ backgroundColor: '#0a0f1e', height: '100vh' }}>
        <LoginFormPage
          backgroundImageUrl="https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*y0ZTS6WLwvgAAAAAAAAAAAAADml6AQ/fmt.webp"
          logo="/logo-mark.svg"
          backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"
          title={<span style={{ color: 'rgba(255, 255, 255, 0.95)' }}>Zen Platform</span>}
          subTitle={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>管理后台登录</span>}
          containerStyle={{
            backgroundColor: 'rgba(15, 20, 35, 0.78)',
            backdropFilter: 'blur(12px)',
            color: 'rgba(255, 255, 255, 0.95)',
          }}
          submitter={{
            searchConfig: { submitText: '登录' },
            submitButtonProps: {
              size: 'large',
              loading,
              style: {
                width: '100%',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #F0D060 0%, #D4A537 50%, #A07F1E 100%)',
                border: 'none',
                fontWeight: 600,
                color: '#1a1a1a',
                boxShadow: '0 4px 16px rgba(212, 165, 55, 0.35)',
              },
            },
          }}
          activityConfig={{
            style: {
              boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.2)',
              color: 'rgba(255, 255, 255, 0.85)',
              borderRadius: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            },
            title: <span style={{ color: 'rgba(255, 255, 255, 0.95)' }}>欢迎使用 Zen Platform</span>,
            subTitle: <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>高效、智能的管理平台</span>,
            action: (
              <Button
                size="large"
                style={{
                  borderRadius: 20,
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(4px)',
                  width: 120,
                }}
              >
                了解更多
              </Button>
            ),
          }}
          actions={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              <Divider plain>
                <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontWeight: 'normal', fontSize: 14 }}>
                  其他登录方式
                </span>
              </Divider>
              <Space align="center" size={8}>
                <ToolOutlined style={{ color: 'rgba(255, 255, 255, 0.45)' }} />
                <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 14 }}>
                  开发中，敬请期待
                </span>
              </Space>
            </div>
          }
          onFinish={async (values) => {
            setLoading(true)
            if (loginType === 'account') {
              router.post('/admin/login', {
                login_type: 'account',
                account: values.username,
                password: values.password,
                auto_login: values.autoLogin ? 'true' : 'false',
              }, {
                onFinish: () => setLoading(false),
              })
            } else {
              router.post('/admin/login', {
                login_type: 'phone',
                phone: values.mobile,
                verification_code: values.captcha,
                auto_login: values.autoLogin ? 'true' : 'false',
              }, {
                onFinish: () => setLoading(false),
              })
            }
          }}
        >
          <Tabs
            activeKey={loginType}
            onChange={(key) => setLoginType(key as LoginType)}
            items={[
              { key: 'account', label: <span style={{ color: 'rgba(255,255,255,0.85)' }}>账号密码登录</span> },
              { key: 'phone', label: <span style={{ color: 'rgba(255,255,255,0.85)' }}>手机号登录</span> },
            ]}
          />
          {loginType === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  style: { borderRadius: 8 },
                  prefix: <UserOutlined style={{ color: 'rgba(255, 255, 255, 0.45)' }} className={'prefixIcon'} />,
                }}
                placeholder={'用户名: admin'}
                rules={[{ required: true, title: '请输入用户名!' }]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  style: { borderRadius: 8 },
                  prefix: <LockOutlined style={{ color: 'rgba(255, 255, 255, 0.45)' }} className={'prefixIcon'} />,
                }}
                placeholder={'密码: password123'}
                rules={[{ required: true, title: '请输入密码！' }]}
              />
            </>
          )}
          {loginType === 'phone' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  style: { borderRadius: 8 },
                  prefix: <MobileOutlined style={{ color: 'rgba(255, 255, 255, 0.45)' }} className={'prefixIcon'} />,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPhoneValue(e.target.value),
                }}
                name="mobile"
                placeholder={'手机号'}
                rules={[
                  { required: true, message: '请输入手机号！' },
                  { pattern: /^1\d{10}$/, message: '手机号格式错误！' },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  style: { borderRadius: 8 },
                  prefix: <LockOutlined style={{ color: 'rgba(255, 255, 255, 0.45)' }} className={'prefixIcon'} />,
                }}
                captchaProps={{ size: 'large' }}
                placeholder={'请输入验证码'}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${'获取验证码'}`
                  }
                  return '获取验证码'
                }}
                name="captcha"
                rules={[{ required: true, title: '请输入验证码！' }]}
                onGetCaptcha={async () => {
                  if (!phoneValue || !/^1\d{10}$/.test(phoneValue)) {
                    notification.open({
                      type: 'warning',
                      title: '请输入正确的手机号',
                      placement: 'bottomRight',
                    })
                    throw new Error('请输入正确的手机号')
                  }

                  try {
                    const res = await fetch('/admin/send_login_code', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                      },
                      body: JSON.stringify({ phone: phoneValue }),
                    })
                    const data = await res.json()

                    if (data.code === 0) {
                      notification.open({
                        type: 'success',
                        title: '验证码已发送',
                        description: '请查看控制台获取验证码',
                        placement: 'bottomRight',
                      })
                    } else {
                      notification.open({
                        type: 'error',
                        title: '发送失败',
                        description: data.message,
                        placement: 'bottomRight',
                      })
                      throw new Error(data.message)
                    }
                  } catch (error) {
                    throw error
                  }
                }}
              />
            </>
          )}
          <div style={{ marginBlockEnd: 24, color: 'rgba(255, 255, 255, 0.65)' }}>
            <ProFormCheckbox noStyle name="autoLogin">
              <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>自动登录</span>
            </ProFormCheckbox>
            <a style={{ float: 'right', color: 'rgba(240, 208, 96, 0.85)' }}>
              忘记密码
            </a>
          </div>
        </LoginFormPage>
      </div>
    </ConfigProvider>
  )
}

export default Page
