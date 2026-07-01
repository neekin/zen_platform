import { ConfigProvider, theme } from 'antd'
import { ProLayout } from '@ant-design/pro-components'
import { router, usePage } from '@inertiajs/react'
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'
import { Dropdown, Badge, Tooltip } from 'antd'
import type { ReactNode } from 'react'
import '../styles/admin.css'

const menuRoutes = {
  route: '/admin',
  routes: [
    {
      path: '/admin',
      name: '仪表盘',
      icon: <DashboardOutlined />,
    },
    {
      path: '/admin/users',
      name: '用户管理',
      icon: <UserOutlined />,
    },
    {
      path: '/admin/settings',
      name: '系统设置',
      icon: <SettingOutlined />,
    },
  ],
}

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

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = usePage().props

  return (
    <ConfigProvider theme={darkTheme}>
      <div className="admin-layout">
        <ProLayout
          title="Zen Platform"
          logo="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
          layout="mix"
          fixSiderbar
          route={menuRoutes}
          location={{ pathname: window.location.pathname }}
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
            <Tooltip key="help" title="帮助文档">
              <QuestionCircleOutlined style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)' }} />
            </Tooltip>,
            <Badge key="notification" count={5} size="small">
              <BellOutlined style={{ fontSize: 16, cursor: 'pointer', color: 'rgba(255,255,255,0.65)' }} />
            </Badge>,
          ]}
          contentStyle={{ padding: 24 }}
        >
          {children}
        </ProLayout>
      </div>
    </ConfigProvider>
  )
}
