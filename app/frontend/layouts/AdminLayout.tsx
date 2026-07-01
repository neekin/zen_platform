import { ProLayout } from '@ant-design/pro-components'
import { router, usePage } from '@inertiajs/react'
import type { ReactNode } from 'react'

const menuRoutes = {
  route: '/',
  routes: [
    {
      path: '/admin',
      name: '仪表盘',
      icon: 'DashboardOutlined',
    },
  ],
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = usePage().props

  return (
    <ProLayout
      title="Zen Platform"
      logo={false}
      layout="mix"
      fixSiderbar
      route={menuRoutes}
      location={{ pathname: '/admin' }}
      menuItemRender={(item, dom) => (
        <a onClick={() => item.path && router.visit(item.path)}>{dom}</a>
      )}
      avatarProps={{
        src: undefined,
        title: user?.name || 'Admin',
        size: 'small',
      }}
      actionsRender={() => [
        <a
          key="logout"
          onClick={() => router.delete('/admin/logout')}
          style={{ cursor: 'pointer' }}
        >
          退出登录
        </a>,
      ]}
      contentStyle={{ padding: 24 }}
    >
      {children}
    </ProLayout>
  )
}
