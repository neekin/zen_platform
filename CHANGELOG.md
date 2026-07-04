# Changelog

## [1.0.0] - 2026-07-05

### Added
- **Model DSL** — 声明式字段/关联/展示配置，自动生成 JSON Schema
- **DslTable / DslForm / DslModal** — 运行时从 DSL 元数据动态渲染表格和表单
- **RBAC 权限系统** — Pundit + Rolify，4 级角色，动态权限矩阵
- **审计日志** — PaperTrail 追踪所有变更，支持一键还原
- **实时通知** — ActionCable WebSocket 推送
- **数据导出** — CSV/Excel/PDF 异步导出
- **API 网关** — rack-attack 分层限流 + 4 种认证方式
- **富文本编辑器** — Lexical 引擎，20 个插件（Mermaid/KaTeX/代码块）
- **脚手架生成器** — `zen:admin` / `zen:api` 一键生成 CRUD + Swagger 文档
- **多产品形态** — CRUD 表格、看板拖拽、日历视图、画廊网格
- **软删除** — `product :soft_delete` DSL 声明
- **ErrorBoundary** — React 错误边界组件
- **NProgress** — Inertia 页面加载进度条
- **权限管理页面** — 角色列表 + Drawer 内权限矩阵配置
- **系统设置菜单** — 用户管理、角色管理、权限管理、API Key、审计日志
- **VitePress 文档站点** — 36 篇文档
- **前端测试** — Vitest 82 tests
- **后端测试** — RSpec 142 examples

### Security
- constantize RCE 白名单防护
- send_file 路径遍历防护
- CSP 生产环境移除 unsafe_inline
- JWT 独立 secret（credentials 优先）
- meta_controller 加认证

### Fixed
- 仪表盘/着陆页版本号动态读取
- 菜单高亮使用 window.location.pathname
- 通知 WebSocket 连接修正
- antd v6 全部废弃 API 适配
