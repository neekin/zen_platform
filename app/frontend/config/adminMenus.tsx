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
  KeyOutlined,
  TranslationOutlined,
  BranchesOutlined,
  NodeIndexOutlined,
  CarryOutOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
export function useMenuRoutes() {
  const { t } = useTranslation()

  return {
    route: '/admin',
    routes: [
      {
        path: '/admin/dashboard',
        name: t('menu.dashboard'),
        icon: <DashboardOutlined />,
      },
      {
        path: '/admin/settings',
        name: t('menu.systemSettings'),
        icon: <SettingOutlined />,
        routes: [
          {
            path: '/admin/users',
            name: t('menu.userManagement'),
            icon: <UserOutlined />,
          },
          {
            path: '/admin/roles',
            name: t('menu.roleManagement'),
            icon: <TeamOutlined />,
          },
          {
            path: '/admin/permissions',
            name: t('menu.permissionManagement'),
            icon: <SafetyCertificateOutlined />,
          },
          {
            path: '/admin/api_keys',
            name: t('menu.apiKey'),
            icon: <KeyOutlined />,
          },
          {
            path: '/admin/audit_logs',
            name: t('menu.auditLog'),
            icon: <AuditOutlined />,
          },
          {
            path: '/admin/dictionaries',
            name: t('menu.dictionaryManagement'),
            icon: <TranslationOutlined />,
          },
        ],
      },
    ],
  }
}

// 保持静态导出兼容（非 hook 场景）
export const menuRoutes = {
  route: '/admin',
  routes: [
    { path: '/admin/dashboard', name: '仪表盘', icon: <DashboardOutlined /> },
    {
      path: '/admin/settings',
      name: '系统设置',
      icon: <SettingOutlined />,
      routes: [
        { path: '/admin/users', name: '用户管理', icon: <UserOutlined /> },
        { path: '/admin/roles', name: '角色管理', icon: <TeamOutlined /> },
        { path: '/admin/permissions', name: '权限管理', icon: <SafetyCertificateOutlined /> },
        { path: '/admin/api_keys', name: 'API Key', icon: <KeyOutlined /> },
        { path: '/admin/audit_logs', name: '审计日志', icon: <AuditOutlined /> },
        { path: '/admin/dictionaries', name: '字典管理', icon: <TranslationOutlined /> },
      ],
    },
  ],
}
