---
title: API 参考
---

# API 参考

Zen Platform 提供 RESTful JSON API，自动根据 Model DSL 生成端点。

## Base URL

- 开发：`http://localhost:3000/api/v1`
- 生产：配置 `API_BASE_URL` 环境变量

## 认证

所有 API 端点（除元数据和公开资源）需要认证。

支持方式：

| 方式 | 文档 |
|------|------|
| JWT | [认证方式](./authentication) |
| API Key | [认证方式](./authentication) |
| Bearer Token | [认证方式](./authentication) |
| Signature | [认证方式](./authentication) |

认证解决"你是谁"的问题，权限控制解决"你能做什么"的问题。详见 [权限控制](./permissions)。

## 字段过滤

脚手架生成的 API 默认返回所有字段。生产环境必须限制返回字段，排除敏感信息。详见 [字段过滤](./field-filtering)。

## 通用响应格式

### 成功

```json
{
  "code": 0,
  "message": "成功",
  "data": { "id": 1, "title": "..." }
}
```

### 错误

```json
{
  "code": 1,
  "message": "错误信息"
}
```

## 内置端点

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/api/v1/health` | 健康检查 | 无 |
| POST | `/api/v1/auth/login` | JWT 登录 | 无 |
| GET | `/api/v1/auth/me` | 当前用户 | JWT |
| GET | `/api/v1/meta/:model` | 模型元数据 | 无 |
| GET | `/api/v1/users` | 用户列表 | API Key/JWT |
| GET | `/api/v1/users/:id` | 用户详情 | API Key/JWT |

## 分页

```bash
GET /api/v1/articles?page=2&per_page=20
```

## 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求错误 |
| 401 | 未认证 |
| 404 | 资源不存在 |
| 429 | 限流 |

## 限流

| 端点 | 限制 |
|------|------|
| 全局 API | 60 次/分钟 |
| API Key 认证 | 300 次/分钟 |
| 登录端点 | 5 次/20 秒 |

超限返回 429，响应头包含 `X-RateLimit-*` 和 `Retry-After` 信息。

## Swagger 文档

访问 `/api-docs` 查看完整的 OpenAPI 文档。
