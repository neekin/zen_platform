/**
 * Admin 后台侧边栏菜单配置
 */
import {
  DashboardOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  AuditOutlined,
  ProjectOutlined,
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
      path: '/admin/articles',
      name: '文章管理',
      icon: <FileTextOutlined />,
    },
    {
      path: '/admin/tasks',
      name: '任务管理',
      icon: <ProjectOutlined />,
    },
    {
      path: '/admin/products',
      name: '商品管理',
      icon: <ShoppingCartOutlined />,
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
