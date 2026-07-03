/**
 * Admin 后台侧边栏菜单配置
 */
import {
  DashboardOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  AuditOutlined,
  ProjectOutlined,
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
      path: '/admin/audit_logs',
      name: '审计日志',
      icon: <AuditOutlined />,
    },
  ],
}
