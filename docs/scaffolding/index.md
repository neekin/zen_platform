# 脚手架概述

Zen Platform 提供两个生成器：

- **`zen:admin`** — 生成 Admin CRUD（Controller + 页面 + 路由）
- **`zen:api`** — 生成 API CRUD（Controller + Swagger spec + 路由）

## 工作原理

生成器读取 Model 的 DSL 元数据，自动生成：

1. Controller（含 `zen_props` + `policy_scope` + `authorize`）
2. 页面组件（使用 DslTable + DslForm）
3. 路由配置
4. Swagger spec（API 生成器）

## 下一步

- [Admin 生成器](/scaffolding/admin) — 管理后台 CRUD
- [API 生成器](/scaffolding/api) — REST API
