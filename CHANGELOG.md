# Changelog

## [v0.3.0] - 2026-07-04

### Added
- 前端测试覆盖（Vitest + React Testing Library，35 tests）
- PaperTrail 兼容性验证（6 tests）
- 系统设置菜单（用户管理、角色管理、审计日志）
- DslModal 组件（统一弹窗封装，高度限制）
- 审计日志还原功能（支持 update/destroy 事件）
- 用户管理 CRUD（ProTable + DslModal + 角色分配）
- 角色管理 CRUD（内置角色保护）
- VitePress 文档站点（19 篇文档）

### Fixed
- PaperTrail YAML 格式兼容（safe_parse 统一处理）
- pro-components 使用规范（Card→ProCard, Table→ProTable, Descriptions→ProDescriptions）
- 弹窗高度优化（不超过浏览器视图，内容区域可滚动）
- LinkDialog DslModal 导入路径修正
- 脚手架模板 modal 模式补 Show.tsx

### Changed
- GitHub Actions CI 添加前端 build 步骤
- .gitignore 排除 docs/.vitepress/dist 构建产物
- 菜单重构：系统设置一级菜单（用户/角色/审计日志二级）

### Technical
- **Backend**: Rails 8.1 + Pundit + Rolify + PaperTrail + rack-attack
- **Frontend**: React 19 + TypeScript + Ant Design 6 + Pro Components + VitePress
- **Tests**: RSpec 85 examples + Vitest 35 tests = 120 total, 0 failures
- **CI**: 5 jobs (backend, frontend, security, swagger, docs)
