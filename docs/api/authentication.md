# 认证方式

Zen Platform API 支持 4 种认证方式。

## 1. JWT Token

```bash
# 登录获取 token
curl -X POST /api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account": "admin@example.com", "password": "password123"}'

# 使用 token
curl /api/v1/users \
  -H "Authorization: Bearer <token>"
```

## 2. API Key

```bash
curl /api/v1/users \
  -H "X-Api-Key: <your-api-key>"
```

API Key 在用户管理页面创建，支持过期时间。

## 3. Bearer Token

与 JWT 相同的 Authorization header，但使用 Bearer schema：

```bash
curl /api/v1/users \
  -H "Authorization: Bearer <jwt-token>"
```

## 4. HMAC 签名

用于服务端到服务端通信：

```bash
curl -X POST /api/v1/payment \
  -H "X-App-Id: your-app-id" \
  -H "X-Signature: <hmac-sha256-signature>" \
  -H "X-Timestamp: <unix-timestamp>" \
  -d '{"amount": 100}'
```

签名算法：`HMAC-SHA256(secret, "#{timestamp}\n#{request_body}")`

## 限流

| 端点 | 限制 |
|------|------|
| 全局 API | 60 次/分钟 |
| API Key 认证 | 300 次/分钟 |
| 登录端点 | 5 次/20 秒 |

超限返回 429，响应头包含 `X-RateLimit-*` 信息。
