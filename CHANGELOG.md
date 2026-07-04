# Changelog

## [v0.5.0] - 2026-07-04

### Added
- 5 个缺失的 Policy 文件（Article / Comment / ApiKey / Export / Notification），Policy 全覆盖 10/10
- 10 个 Admin 控制器 spec（Articles / Comments / Users / Roles / Permissions / ApiKeys / Exports / Notifications / Sessions / Dashboard）
- 6 个模型 spec（Article / Comment / Role / Permission / Export / Notification）
- 2 个 Policy spec（Article / Comment）
- Swagger 端点补充：API Key 管理接口文档（GET / POST / DELETE /api/v1/api_keys）
- 前端 ESLint + Prettier 代码风格工具链（.eslintrc.cjs + .prettierrc + .eslintignore + lint/format 脚本）
- Bullet gem（N+1 查询检测，开发环境自动启用）
- i18n 基础结构（中文 + 英文 locale 文件）
- 前端页面级测试（ArticlesIndex）

### Fixed
- CI Node.js 版本从 20 升级到 24（修复 GitHub Actions deprecation 警告）
- CI 文档构建拆分为 docs-check + docs-deploy（PR 也验证文档构建，部署仅在 main 分支）
- 删除残留的 IMPROVEMENT_GUIDE.md

### Changed
- RSpec 测试从 66 增加到 140 examples（+74）
- 前端测试从 38 增加到 40 tests（+2）
- Swagger 端点从 5 个增加到 7 个
- CI 新增 RuboCop lint job + docs-check job

## [v0.4.0] - 2026-07-04

### Added
- 示例模型 Article + Comment（完整 DSL + Admin CRUD + 种子数据）
- 前端组件文档（7 篇：概述、DslTable、DslForm、DslModal、表单组件、展示组件、权限组件）
- DSL API 参考文档（zen_meta / zen_fields / zen_props 完整说明）
- 数据库配置文档（SQLite → PostgreSQL 切换指南）
- 配置参考文档（环境变量、Credentials、认证配置集中参考）
- Admin 二开指南（7 个场景：自定义列、操作按钮、字段联动、权限控制、Controller 逻辑、详情页、批量操作）
- 前端组件测试（StatusBadge、RelativeTime、PermissionGuard，共 8 tests）
- VitePress 侧边栏补充 field-filtering 和 permissions 页面

### Fixed
- Dockerfile Ruby 版本不一致（3.4.2 → 4.0.5）
- `docs/api/field-filtering.md` 移除未实现的 `internal: true` 引用，改用 `zen_fields.keys` 白名单
- 脚手架文档补充"添加菜单"必做步骤
- 错误页面（404/422/500）定制为 Zen Platform 品牌风格
- VitePress 侧边栏补充 admin-customization、field-filtering、permissions 入口

### Changed
- VitePress 配置整合所有新增文档到侧边栏和导航栏
- 前端测试从 30 增至 38 tests

### Technical
- **Tests**: RSpec 66 examples + Vitest 38 tests = 104 total, 0 failures
- **Docs**: 26 篇文档（guide 4 + dsl 6 + scaffolding 4 + frontend 7 + rich-text 3 + api 4 + deployment 3）

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
