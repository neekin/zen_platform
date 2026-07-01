import {
  // AlipayOutlined,
  LockOutlined,
  MobileOutlined,
  // TaobaoOutlined,
  ToolOutlined,
  UserOutlined,
  // WeiboOutlined,
} from '@ant-design/icons'
import {
  LoginFormPage,
  ProConfigProvider,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components'
import { router, usePage } from '@inertiajs/react'
import { Button, Divider, Space, Tabs, notification, theme } from 'antd'
import { useEffect, useState } from 'react'
import type { SharedProps } from '../../types'

type LoginType = 'phone' | 'account'

// const iconStyles: CSSProperties = {
//   color: 'rgba(0, 0, 0, 0.2)',
//   fontSize: '18px',
//   verticalAlign: 'middle',
//   cursor: 'pointer',
// }

const Page = () => {
  const [loginType, _setLoginType] = useState<LoginType>('account')
  const [loading, setLoading] = useState(false)
  const { token } = theme.useToken()
  const { flash } = usePage<SharedProps>().props

  useEffect(() => {
    if (flash?.alert) {
      notification.error({
        message: '登录失败',
        description: flash.alert,
        placement: 'bottomRight',
      })
    }
    if (flash?.notice) {
      notification.success({
        message: flash.notice,
        placement: 'bottomRight',
      })
    }
  }, [flash?.ts])

  return (
    <div
      style={{
        backgroundColor: 'white',
        height: '100vh',
      }}
    >
      <LoginFormPage
        backgroundImageUrl="https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*y0ZTS6WLwvgAAAAAAAAAAAAADml6AQ/fmt.webp"
        logo="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
        backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"
        title="Zen Platform"
        containerStyle={{
          backgroundColor: 'rgba(0, 0, 0,0.65)',
          backdropFilter: 'blur(4px)',
        }}
        subTitle="管理后台登录"
        submitter={{
          searchConfig: {
            submitText: '登录',
          },
          submitButtonProps: {
            size: 'large',
            loading,
            style: {
              width: '100%',
            },
          },
        }}
        activityConfig={{
          style: {
            boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.2)',
            color: token.colorTextHeading,
            borderRadius: 8,
            backgroundColor: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(4px)',
          },
          title: '欢迎使用 Zen Platform',
          subTitle: '高效、智能的管理平台',
          action: (
            <Button
              size="large"
              style={{
                borderRadius: 20,
                background: token.colorBgElevated,
                color: token.colorPrimary,
                width: 120,
              }}
            >
              了解更多
            </Button>
          ),
        }}
        actions={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Divider plain>
              <span
                style={{
                  color: token.colorTextPlaceholder,
                  fontWeight: 'normal',
                  fontSize: 14,
                }}
              >
                其他登录方式
              </span>
            </Divider>
            <Space align="center" size={8}>
              <ToolOutlined style={{ color: token.colorTextPlaceholder }} />
              <span style={{ color: token.colorTextPlaceholder, fontSize: 14 }}>
                开发中，敬请期待
              </span>
            </Space>
            {/* 其他登录方式图标 - 开发完成后取消注释
            <Space align="center" size={24}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  height: 40,
                  width: 40,
                  border: '1px solid ' + token.colorPrimaryBorder,
                  borderRadius: '50%',
                }}
              >
                <AlipayOutlined style={{ ...iconStyles, color: '#1677FF' }} />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  height: 40,
                  width: 40,
                  border: '1px solid ' + token.colorPrimaryBorder,
                  borderRadius: '50%',
                }}
              >
                <TaobaoOutlined style={{ ...iconStyles, color: '#FF6A10' }} />
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  height: 40,
                  width: 40,
                  border: '1px solid ' + token.colorPrimaryBorder,
                  borderRadius: '50%',
                }}
              >
                <WeiboOutlined style={{ ...iconStyles, color: '#1890ff' }} />
              </div>
            </Space>
            */}
          </div>
        }
        onFinish={async (values) => {
          setLoading(true)
          if (loginType === 'account') {
            router.post('/admin/login', {
              account: values.username,
              password: values.password,
              autoLogin: values.autoLogin ? 'true' : 'false',
            }, {
              onFinish: () => setLoading(false),
            })
          } else {
            notification.info({
              message: '手机验证码登录暂未实现',
              placement: 'bottomRight',
            })
            setLoading(false)
          }
        }}
      >
        <Tabs
          activeKey={loginType}
          onChange={(key) => _setLoginType(key as LoginType)}
          items={[
            { key: 'account', label: '账号密码登录' },
            { key: 'phone', label: '手机号登录' },
          ]}
        />
        {loginType === 'account' && (
          <>
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: (
                  <UserOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={'prefixIcon'}
                  />
                ),
              }}
              placeholder={'用户名: admin'}
              rules={[
                {
                  required: true,
                  message: '请输入用户名!',
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: (
                  <LockOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={'prefixIcon'}
                  />
                ),
              }}
              placeholder={'密码: password123'}
              rules={[
                {
                  required: true,
                  message: '请输入密码！',
                },
              ]}
            />
          </>
        )}
        {loginType === 'phone' && (
          <>
            <ProFormText
              fieldProps={{
                size: 'large',
                prefix: (
                  <MobileOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={'prefixIcon'}
                  />
                ),
              }}
              name="mobile"
              placeholder={'手机号'}
              rules={[
                {
                  required: true,
                  message: '请输入手机号！',
                },
                {
                  pattern: /^1\d{10}$/,
                  message: '手机号格式错误！',
                },
              ]}
            />
            <ProFormCaptcha
              fieldProps={{
                size: 'large',
                prefix: (
                  <LockOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={'prefixIcon'}
                  />
                ),
              }}
              captchaProps={{
                size: 'large',
              }}
              placeholder={'请输入验证码'}
              captchaTextRender={(timing, count) => {
                if (timing) {
                  return `${count} ${'获取验证码'}`;
                }
                return '获取验证码';
              }}
              name="captcha"
              rules={[
                {
                  required: true,
                  message: '请输入验证码！',
                },
              ]}
              onGetCaptcha={async () => {
                notification.success({
                  message: '获取验证码成功！验证码为：1234',
                  placement: 'bottomRight',
                })
              }}
            />
          </>
        )}
        <div
          style={{
            marginBlockEnd: 24,
          }}
        >
          <ProFormCheckbox noStyle name="autoLogin">
            自动登录
          </ProFormCheckbox>
          <a
            style={{
              float: 'right',
            }}
          >
            忘记密码
          </a>
        </div>
      </LoginFormPage>
    </div>
  );
};

const LoginPage = () => {
  return (
    <ProConfigProvider dark>
      <Page />
    </ProConfigProvider>
  );
};

export default () => (
  <>
    <LoginPage />
  </>
);
