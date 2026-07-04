# Changelog

## [v0.3.1] - 2026-07-04

### Fixed
- 权限模型 `allowed?` 添加 super_admin bypass — 超级管理员自动拥有所有权限，不查表
- `RESOURCES` 改为从 `RESOURCE_ACTIONS.keys` 动态派生 — 脚手架生成的新资源自动出现在权限管理 UI
- `seed_defaults!` 改为 `find_or_create_by` — 重新 seed 不再删除自定义权限配置
- `seeds.rb` 补充 `Permission.seed_defaults!` 调用 — 首次部署后权限表不再为空
- 权限管理控制器排除 super_admin — UI 矩阵不显示超级管理员行，更新接口拒绝修改
- `RESOURCE_ACTIONS` 清理残留的 Article/Task/Product 条目
- 生成器 `register_permissions` 注入失败时打印警告（不再静默忽略）

### Changed
- super_admin 不再写入权限表 — 从 `DEFAULTS` 中移除整块定义，零记录零配置
- 新增 `Permission.reset_defaults!` 方法 — 全量重置（删除全部后重建），与 `seed_defaults!`（只增不删）分离
- 权限控制器 `reset` action 改用 `reset_defaults!`
- 生成器只注入 `RESOURCE_ACTIONS`，不再注入 `DEFAULTS` — 新资源默认仅 super_admin 可用，其他角色需在 UI 手动配置

### Seeds
- 最终种子数据：1 用户 + 4 角色 + 23 权限（admin 12 + editor 7 + viewer 4，super_admin 0 条）

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
