import { ConfigProvider, theme } from 'antd'
import { ProLayout } from '@ant-design/pro-components'
import { router, usePage } from '@inertiajs/react'
import {
  LogoutOutlined,
  QuestionCircleOutlined,
  MoonOutlined,
  SunOutlined,
  DesktopOutlined,
} from '@ant-design/icons'
import { Dropdown, Tooltip } from 'antd'
import NotificationBell from '@/components/admin/NotificationBell'
import { useTheme } from '@/hooks/useTheme'
import type { ReactNode } from 'react'
import '../styles/admin.css'
import { menuRoutes } from '@/config/adminMenus'

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#1677FF',
    colorBgContainer: 'rgba(20, 27, 45, 0.85)',
    colorBgElevated: 'rgba(25, 35, 55, 0.9)',
    colorBgLayout: '#0a0f1e',
    colorBorder: 'rgba(100, 140, 200, 0.15)',
    colorBorderSecondary: 'rgba(100, 140, 200, 0.08)',
    borderRadius: 8,
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
  },
  components: {
    Layout: {
      headerBg: 'rgba(10, 15, 30, 0.8)',
      siderBg: 'rgba(12, 18, 35, 0.9)',
      bodyBg: '#0a0f1e',
      headerColor: 'rgba(255, 255, 255, 0.85)',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(22, 119, 255, 0.15)',
      darkItemColor: 'rgba(255, 255, 255, 0.65)',
      darkItemSelectedColor: '#1677FF',
      itemHeight: 40,
    },
    Card: {
      colorBgContainer: 'rgba(20, 27, 45, 0.7)',
    },
    Table: {
      colorBgContainer: 'rgba(20, 27, 45, 0.5)',
      headerBg: 'rgba(22, 119, 255, 0.08)',
    },
  },
}

const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#1677FF',
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f5f7fa',
    colorBorder: '#e8ecf0',
    colorBorderSecondary: '#f0f2f5',
    borderRadius: 8,
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#ffffff',
      bodyBg: '#f5f7fa',
      headerColor: 'rgba(0, 0, 0, 0.88)',
    },
    Menu: {
      itemBg: 'transparent',
      subMenuItemBg: 'transparent',
      itemSelectedBg: 'rgba(22, 119, 255, 0.08)',
      itemColor: 'rgba(0, 0, 0, 0.65)',
      itemSelectedColor: '#1677FF',
      itemHeight: 40,
    },
    Card: {
      colorBgContainer: '#ffffff',
    },
    Table: {
      colorBgContainer: '#ffffff',
      headerBg: 'rgba(22, 119, 255, 0.04)',
    },
  },
}

const themeIcons: Record<string, ReactNode> = {
  dark: <MoonOutlined style={{ fontSize: 16 }} />,
  light: <SunOutlined style={{ fontSize: 16 }} />,
  system: <DesktopOutlined style={{ fontSize: 16 }} />,
}

const themeLabels: Record<string, string> = {
  dark: '深色',
  light: '浅色',
  system: '跟随系统',
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const page = usePage()
  const { user } = page.props
  const currentUrl = page.url
  const { mode, resolved, setMode } = useTheme()

  const currentTheme = resolved === 'dark' ? darkTheme : lightTheme
  const iconColor = resolved === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)'

  return (
    <ConfigProvider theme={currentTheme}>
      <div className="admin-layout" data-theme={resolved}>
        <ProLayout
          title="Zen Platform"
          logo="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
          layout="mix"
          fixSiderbar
          route={menuRoutes}
          location={{ pathname: currentUrl }}
          menuItemRender={(item, dom) => (
            <a onClick={() => item.path && router.visit(item.path)}>{dom}</a>
          )}
          avatarProps={{
            src: undefined,
            title: user?.name || 'Admin',
            size: 'small',
            render: (_props, dom) => (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: '退出登录',
                      onClick: () => router.delete('/admin/logout'),
                    },
                  ],
                }}
              >
                {dom}
              </Dropdown>
            ),
          }}
          actionsRender={() => [
            <Dropdown
              key="theme"
              menu={{
                items: (['light', 'dark', 'system'] as const).map((m) => ({
                  key: m,
                  icon: themeIcons[m],
                  label: themeLabels[m],
                  onClick: () => setMode(m),
                })),
                selectedKeys: [mode],
              }}
            >
              <Tooltip title={themeLabels[mode]}>
                <span style={{ display: 'inline-flex', cursor: 'pointer' }}>
                  {themeIcons[mode]}
                </span>
              </Tooltip>
            </Dropdown>,
            <Tooltip key="help" title="帮助文档">
              <QuestionCircleOutlined style={{ fontSize: 16, color: iconColor }} />
            </Tooltip>,
            <NotificationBell key="notification" />,
          ]}
          contentStyle={{ padding: 24 }}
        >
          {children}
        </ProLayout>
      </div>
    </ConfigProvider>
  )
}
