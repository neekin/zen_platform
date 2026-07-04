---
title: 认证方式
---

# 认证方式

Zen Platform API 支持 4 种认证方式。

## JWT（推荐）

```bash
# 获取 token
curl -X POST /api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account": "admin@example.com", "password": "password123"}'

# 响应
{ "code": 0, "data": { "token": "eyJhbGciOiJIUzI1NiJ9..." } }

# 使用 token
curl /api/v1/users -H "Authorization: Bearer <token>"
```

JWT payload：
```json
{
  "user_id": 1,
  "exp": 1719900000
}
```

算法：HS256，密钥：`Rails.application.secret_key_base`

## API Key

适用于服务间调用：

```bash
curl /api/v1/users -H "X-Api-Key: zp_xxxxxxxxxxxxx"
```

API Key 在 Admin 后台创建，支持过期时间。格式：64 位 hex 字符串。

## Bearer Token

与 JWT 相同的 Authorization header，复用 JWT 解码逻辑：

```bash
curl /api/v1/users -H "Authorization: Bearer <jwt-token>"
```

## Signature（高安全）

适用于需要防篡改的场景（服务端到服务端）：

```bash
curl -X POST /api/v1/payment \
  -H "X-App-Id: your-app-id" \
  -H "X-Signature: <hmac-sha256-signature>" \
  -H "X-Timestamp: <unix-timestamp>" \
  -d '{"amount": 100}'
```

签名算法：`HMAC-SHA256(secret, "#{timestamp}\n#{request_body}")`

服务端验证：
- 时间戳偏差 ≤ 5 分钟（防重放）
- 签名匹配（防篡改）
- 使用 `secure_compare`（防时序攻击）
