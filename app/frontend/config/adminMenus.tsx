/**
 * Admin 后台侧边栏菜单配置
 *
 * 使用方法：
 * 1. 在 routes 数组中添加新的菜单项
 * 2. 每个菜单项包含：path（路由）、name（显示名称）、icon（图标）
 * 3. 支持嵌套子菜单（使用 children 属性）
 *
 * 示例：
 * {
 *   path: '/admin/articles',
 *   name: '文章管理',
 *   icon: <FileTextOutlined />,
 * }
 *
 * 图标导入：
 * import { FileTextOutlined } from '@ant-design/icons'
 */
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  OrderedListOutlined,
  AppstoreOutlined,
  TagOutlined,
  CommentOutlined,
  FileImageOutlined,
} from '@ant-design/icons'

// 菜单配置
// TODO: 根据实际业务需求添加或修改菜单项
export const menuRoutes = {
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
    // ===========================================
    // 以下是示例菜单项，请根据实际需求修改
    // ===========================================
    {
      path: '/admin/articles',
      name: '文章管理',
      icon: <FileTextOutlined />,
    },
    // {
    //   path: '/admin/products',
    //   name: '商品管理',
    //   icon: <ShoppingCartOutlined />,
    // },
    // {
    //   path: '/admin/orders',
    //   name: '订单管理',
    //   icon: <OrderedListOutlined />,
    // },
    // {
    //   path: '/admin/categories',
    //   name: '分类管理',
    //   icon: <AppstoreOutlined />,
    // },
    // {
    //   path: '/admin/tags',
    //   name: '标签管理',
    //   icon: <TagOutlined />,
    // },
    // {
    //   path: '/admin/comments',
    //   name: '评论管理',
    //   icon: <CommentOutlined />,
    // },
    // {
    //   path: '/admin/media',
    //   name: '媒体库',
    //   icon: <FileImageOutlined />,
    // },
    // ===========================================
    {
      path: '/admin/settings',
      name: '系统设置',
      icon: <SettingOutlined />,
    },
  ],
}
