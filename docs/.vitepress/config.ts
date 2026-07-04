import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Zen Platform',
  description: '声明式全栈应用生成平台',
  lang: 'zh-CN',
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'Model DSL', link: '/dsl/' },
      { text: '脚手架', link: '/scaffolding/' },
      { text: '前端组件', link: '/frontend/' },
      { text: '富文本', link: '/rich-text/' },
      { text: 'API', link: '/api/' },
      { text: '部署', link: '/deployment/' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速上手', link: '/guide/quick-start' },
            { text: '安装配置', link: '/guide/installation' },
            { text: '配置参考', link: '/guide/configuration' },
            { text: '通知系统', link: '/guide/notifications' },
          ],
        },
      ],
      '/dsl/': [
        {
          text: 'Model DSL',
          items: [
            { text: '概述', link: '/dsl/' },
            { text: '字段定义', link: '/dsl/fields' },
            { text: '关联定义', link: '/dsl/associations' },
            { text: '展示配置', link: '/dsl/display' },
            { text: '产品形态', link: '/dsl/products' },
            { text: 'API 参考', link: '/dsl/api-reference' },
          ],
        },
      ],
      '/scaffolding/': [
        {
          text: '脚手架',
          items: [
            { text: '概述', link: '/scaffolding/' },
            { text: 'Admin 生成器', link: '/scaffolding/admin' },
            { text: 'API 生成器', link: '/scaffolding/api' },
            { text: 'Admin 二开指南', link: '/scaffolding/admin-customization' },
          ],
        },
      ],
      '/frontend/': [
        {
          text: '前端组件',
          items: [
            { text: '概述', link: '/frontend/' },
            { text: 'DslTable', link: '/frontend/dsl-table' },
            { text: 'DslForm', link: '/frontend/dsl-form' },
            { text: 'DslModal', link: '/frontend/dsl-modal' },
            { text: '表单组件', link: '/frontend/form-widgets' },
            { text: '展示组件', link: '/frontend/display-widgets' },
            { text: '权限组件', link: '/frontend/permission-guard' },
          ],
        },
      ],
      '/rich-text/': [
        {
          text: '富文本编辑器',
          items: [
            { text: '概述', link: '/rich-text/' },
            { text: '内置插件', link: '/rich-text/plugins' },
            { text: '自定义插件', link: '/rich-text/custom-plugin' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API',
          items: [
            { text: '概述', link: '/api/' },
            { text: '认证方式', link: '/api/authentication' },
            { text: '字段过滤', link: '/api/field-filtering' },
            { text: '权限控制', link: '/api/permissions' },
          ],
        },
      ],
      '/deployment/': [
        {
          text: '部署',
          items: [
            { text: '概述', link: '/deployment/' },
            { text: 'Docker 部署', link: '/deployment/docker' },
            { text: '数据库配置', link: '/deployment/database' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/neekin/zen_platform' },
    ],
    search: {
      provider: 'local',
    },
  },
})
