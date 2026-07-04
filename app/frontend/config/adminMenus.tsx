/**
 * Admin 后台侧边栏菜单配置
 */
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  AuditOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'

export const menuRoutes = {
  route: '/admin',
  routes: [
    {
      path: '/admin',
      name: '仪表盘',
      icon: <DashboardOutlined />,
    },
    {
      path: '/admin/settings',
      name: '系统设置',
      icon: <SettingOutlined />,
      routes: [
        {
          path: '/admin/users',
          name: '用户管理',
          icon: <UserOutlined />,
        },
        {
          path: '/admin/roles',
          name: '角色管理',
          icon: <TeamOutlined />,
        },
        {
          path: '/admin/permissions',
          name: '权限管理',
          icon: <SafetyCertificateOutlined />,
        },
        {
          path: '/admin/audit_logs',
          name: '审计日志',
          icon: <AuditOutlined />,
        },
      ],
    },
  ],
}
