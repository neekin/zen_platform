import { ConfigProvider, theme } from 'antd'
import { ProLayout } from '@ant-design/pro-components'
import { router, usePage } from '@inertiajs/react'
import {
  LogoutOutlined,
  QuestionCircleOutlined,
  MoonOutlined,
  SunOutlined,
  DesktopOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Dropdown, Tooltip } from 'antd'
import NotificationBell from '@/components/admin/NotificationBell'
import CommandPalette from '@/components/admin/CommandPalette'
import { useTheme } from '@/hooks/useTheme'
import { useZenConfig } from '@/hooks/useZenConfig'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import '../styles/admin.css'
import { menuRoutes } from '@/config/adminMenus'

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
  const { mode, resolved, setMode } = useTheme()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const zenConfig = useZenConfig()

  const currentTheme = resolved === 'dark' ? {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: zenConfig.primary_color,
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
        darkItemSelectedBg: `${zenConfig.primary_color}26`,
        darkItemColor: 'rgba(255, 255, 255, 0.65)',
        darkItemSelectedColor: zenConfig.primary_color,
        itemHeight: 40,
      },
      Card: { colorBgContainer: 'rgba(20, 27, 45, 0.7)' },
      Table: { colorBgContainer: 'rgba(20, 27, 45, 0.5)', headerBg: `${zenConfig.primary_color}14` },
    },
  } : {
    algorithm: theme.defaultAlgorithm,
    token: {
      colorPrimary: zenConfig.primary_color,
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
        itemSelectedBg: `${zenConfig.primary_color}14`,
        itemColor: 'rgba(0, 0, 0, 0.65)',
        itemSelectedColor: zenConfig.primary_color,
        itemHeight: 40,
      },
      Card: { colorBgContainer: '#ffffff' },
      Table: { colorBgContainer: '#ffffff', headerBg: `${zenConfig.primary_color}0a` },
    },
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const pathname = window.location.pathname
  const iconColor = resolved === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)'

  return (
    <ConfigProvider theme={currentTheme}>
      <div className="admin-layout" data-theme={resolved}>
        <ProLayout
          title={zenConfig.app_name}
          logo={zenConfig.logo}
          layout={zenConfig.sidebar_mode as any}
          fixSiderbar
          route={menuRoutes}
          location={{ pathname }}
          menuItemRender={(item, dom) => (
            <a
              onClick={(e) => {
                e.preventDefault()
                if (item.path && item.path !== pathname) {
                  router.visit(item.path)
                }
              }}
            >
              {dom}
            </a>
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
                      key: 'profile',
                      icon: <UserOutlined />,
                      label: '个人中心',
                      onClick: () => router.visit('/admin/profile'),
                    },
                    {
                      type: 'divider',
                    },
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
            <Tooltip key="help" title="使用文档">
              <a href="https://zen.justfunit.net" target="_blank" rel="noopener noreferrer">
                <QuestionCircleOutlined style={{ fontSize: 16, color: iconColor }} />
              </a>
            </Tooltip>,
            <NotificationBell key="notification" />,
          ]}
          contentStyle={{ padding: 24 }}
        >
          {children}
        </ProLayout>
        <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </div>
    </ConfigProvider>
  )
}
