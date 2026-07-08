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
import { useTranslation } from 'react-i18next'
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
  const { flash } = usePage().props
  const { t } = useTranslation()

  useEffect(() => {
    if (flash?.alert) {
      notification.open({
        type: 'error',
        title: t('login.loginFailed'),
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
          subTitle={<span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{t('login.title')}</span>}
          containerStyle={{
            backgroundColor: 'rgba(15, 20, 35, 0.78)',
            backdropFilter: 'blur(12px)',
            color: 'rgba(255, 255, 255, 0.95)',
          }}
          submitter={{
            searchConfig: { submitText: t('login.login') },
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
            title: <span style={{ color: 'rgba(255, 255, 255, 0.95)' }}>{t('login.welcomeTitle')}</span>,
            subTitle: <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{t('login.welcomeSubtitle')}</span>,
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
                {t('login.learnMore')}
              </Button>
            ),
          }}
          actions={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              <Divider plain>
                <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontWeight: 'normal', fontSize: 14 }}>
                  {t('login.otherLoginMethods')}
                </span>
              </Divider>
              <Space align="center" size={8}>
                <ToolOutlined style={{ color: 'rgba(255, 255, 255, 0.45)' }} />
                <span style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 14 }}>
                  {t('login.comingSoon')}
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
              { key: 'account', label: <span style={{ color: 'rgba(255,255,255,0.85)' }}>{t('login.accountLogin')}</span> },
              { key: 'phone', label: <span style={{ color: 'rgba(255,255,255,0.85)' }}>{t('login.phoneLogin')}</span> },
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
                placeholder={t('login.usernamePlaceholder')}
                rules={[{ required: true, title: t('login.enterUsername') }]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  style: { borderRadius: 8 },
                  prefix: <LockOutlined style={{ color: 'rgba(255, 255, 255, 0.45)' }} className={'prefixIcon'} />,
                }}
                placeholder={t('login.passwordPlaceholder')}
                rules={[{ required: true, title: t('login.enterPassword') }]}
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
                placeholder={t('login.phonePlaceholder')}
                formItemProps={{ validateTrigger: 'onBlur' }}
                rules={[
                  { required: true, message: t('login.enterPhone') },
                  { pattern: /^1\d{10}$/, message: t('login.phoneFormatError') },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  style: { borderRadius: 8 },
                  prefix: <LockOutlined style={{ color: 'rgba(255, 255, 255, 0.45)' }} className={'prefixIcon'} />,
                }}
                captchaProps={{ size: 'large' }}
                placeholder={t('login.captchaPlaceholder')}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${t('login.getCaptcha')}`
                  }
                  return t('login.getCaptcha')
                }}
                name="captcha"
                rules={[{ required: true, title: t('login.enterCaptcha') }]}
                onGetCaptcha={async () => {
                  if (!phoneValue || !/^1\d{10}$/.test(phoneValue)) {
                    notification.open({
                      type: 'warning',
                      title: t('login.enterCorrectPhone'),
                      placement: 'bottomRight',
                    })
                    throw new Error(t('login.enterCorrectPhone'))
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
                        title: t('login.captchaSent'),
                        description: t('login.checkConsole'),
                        placement: 'bottomRight',
                      })
                    } else {
                      notification.open({
                        type: 'error',
                        title: t('login.sendFailed'),
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
              <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{t('login.autoLogin')}</span>
            </ProFormCheckbox>
            <a href="/admin/password/new" style={{ float: 'right', color: 'rgba(240, 208, 96, 0.85)' }}>
              {t('login.forgotPassword')}
            </a>
          </div>
        </LoginFormPage>
      </div>
    </ConfigProvider>
  )
}

export default Page
