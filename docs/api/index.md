# API 概述

Zen Platform 提供 RESTful API，支持 4 种认证方式。

## 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/health` | 健康检查（公开） |
| POST | `/api/v1/auth/login` | JWT 登录 |
| GET | `/api/v1/auth/me` | 当前用户信息 |
| GET | `/api/v1/meta/:model` | 模型 DSL 元数据 |
| GET | `/api/v1/users` | 用户列表 |
| GET | `/api/v1/users/:id` | 用户详情 |

## 响应格式

```json
{
  "code": 0,
  "message": "成功",
  "data": { ... }
}
```

错误响应：

```json
{
  "code": 1,
  "message": "错误信息"
}
```

## 认证

详见 [认证方式](/api/authentication)

## Swagger 文档

访问 `/api-docs` 查看完整的 OpenAPI 文档。
