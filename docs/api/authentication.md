---
title: 认证方式
---

# 认证方式

Zen Platform API 支持 4 种认证方式，按安全级别从低到高：

| 认证方式 | 请求头 | 适用场景 | 如何获取 |
|---------|--------|---------|---------|
| JWT（推荐） | `Authorization: Bearer <token>` | 前端应用、通用场景 | 调用登录接口 |
| API Key | `X-Api-Key: <key>` | 服务间调用、脚本自动化 | Admin 后台创建 |
| Bearer Token | `Authorization: Bearer <token>` | 与 JWT 相同 | 与 JWT 相同 |
| Signature（高安全） | `X-App-Id` + `X-Signature` + `X-Timestamp` | 支付、防篡改服务端调用 | credentials 配置 |

## JWT（推荐）

### 获取 Token

调用登录接口，用账号密码换取 JWT token：

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account": "admin@example.com", "password": "password123"}'
```

响应：

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": { "id": 1, "username": "admin", "email": "admin@example.com", "name": "管理员" }
  }
}
```

### 使用 Token

```bash
curl http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

### 技术细节

- **算法**：HS256
- **密钥**：`Rails.application.secret_key_base`（自动生成，不可更改）
- **有效期**：24 小时
- **Payload**：`{ "user_id": 1, "exp": 1719900000 }`
- **注意**：Token 签发后在过期前无法主动撤销（无黑名单机制）。如需撤销，修改 `secret_key_base` 会使所有 token 失效，但也会导致所有用户登出。

### 验证当前用户

```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

## API Key

适用于服务间调用、定时脚本、自动化任务等无需交互登录的场景。

**权限继承**：API Key 绑定到用户，自动继承该用户的角色和权限。例如 viewer 角色的 Key 只能访问 viewer 有权限的接口。无需为 Key 单独配置权限。

### 创建 API Key

有两种方式创建 API Key：

#### 方式一：Admin 后台（管理员操作）

管理员可以为任意用户创建 Key：

1. 登录 Admin 后台（`http://localhost:3000/admin`）
2. 进入 **系统设置 → API Key**
3. 点击「新建 API Key」
4. 填写信息：
   - **名称**：标识用途，例如「移动端 API」「第三方对接」
   - **所属用户**：Key 绑定的用户，其角色权限决定 API 访问范围
   - **过期时间**：可选，留空则永不过期
5. 创建成功后，**立即复制并保存 Key** — 关闭弹窗后不再显示完整 Key

#### 方式二：API 接口（用户自己创建）

用户登录后通过 API 创建自己的 Key，无需管理员操作：

```bash
# 先登录获取 JWT token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account": "admin@example.com", "password": "password123"}'

# 用 token 创建 API Key
curl -X POST http://localhost:3000/api/v1/api_keys \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"api_key": {"name": "我的移动端Key"}}'
```

响应（仅创建时返回完整 Key）：

```json
{
  "code": 0,
  "message": "创建成功，请妥善保存 Key，此后无法再次查看",
  "data": {
    "id": 1,
    "name": "我的移动端Key",
    "key": "a1b2c3d4e5f6...（64位hex）",
    "expires_at": null,
    "created_at": "2026-07-04T12:00:00Z"
  }
}
```

### 使用 API Key

```bash
curl http://localhost:3000/api/v1/users \
  -H "X-Api-Key: a1b2c3d4e5f6..."
```

### 管理 API Key

#### 通过 API 管理（用户管理自己的 Key）

```bash
# 查看自己的 Key 列表（掩码显示，不含完整 Key）
curl http://localhost:3000/api/v1/api_keys \
  -H "Authorization: Bearer <token>"

# 创建新 Key（设置过期时间）
curl -X POST http://localhost:3000/api/v1/api_keys \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"api_key": {"name": "临时Key", "expires_at": "2026-08-01T00:00:00Z"}}'

# 删除自己的 Key（立即生效）
curl -X DELETE http://localhost:3000/api/v1/api_keys/1 \
  -H "Authorization: Bearer <token>"
```

#### 通过 Admin 后台管理（管理员管理所有用户的 Key）

| 操作 | 路径 | 权限 |
|------|------|------|
| 查看所有 Key | `GET /admin/api_keys` | super_admin, admin |
| 为任意用户创建 Key | `POST /admin/api_keys` | super_admin, admin |
| 删除任意 Key | `DELETE /admin/api_keys/:id` | super_admin, admin |

### 技术细节

- **格式**：64 位 hex 字符串（`SecureRandom.hex(32)`）
- **权限继承**：Key 自动继承所属用户的角色权限，无需单独配置
- **过期**：过期后自动失效，`ApiKey.active` scope 不返回过期记录
- **撤销**：删除 Key 立即生效
- **安全**：完整 Key 仅在创建时返回一次，之后掩码显示
- **隔离**：用户通过 API 只能管理自己的 Key，无法查看或操作他人的 Key

## Bearer Token

与 JWT 完全相同，复用 JWT 解码逻辑。两种说法指的是同一个 token：

```bash
# 以下两种写法等价
curl -H "Authorization: Bearer <jwt-token>" /api/v1/users
curl -H "Authorization: Bearer <jwt-token>" /api/v1/users
```

Bearer Token 存在的意义是：在 `authenticate_with` 中可以与其他认证方式组合使用，例如 `authenticate_with :api_key, :jwt, :bearer_token` 允许客户端用任意一种方式认证。

## Signature（高安全）

适用于需要防篡改的场景，如支付接口、敏感数据操作。通过 HMAC-SHA256 签名确保请求内容不被篡改。

### 配置密钥

Signature 认证使用 `app_id` + `api_secret` 对，密钥存储在 Rails credentials 中：

```bash
# 编辑 credentials（首次需要设置 master key）
bin/rails credentials:edit
```

在打开的文件中添加：

```yaml
api_secrets:
  my_app_id: "my_super_secret_key_123"
  payment_service: "another_secret_for_payment"
```

保存后密钥会被加密存储在 `config/credentials.yml.enc` 中。

### 生成签名

签名算法：`HMAC-SHA256(api_secret, "#{timestamp}\n#{request_body}")`

#### Ruby 示例

```ruby
require 'openssl'
require 'json'
require 'net/http'

app_id     = "my_app_id"
api_secret = "my_super_secret_key_123"
timestamp  = Time.now.to_i.to_s
body       = '{"amount": 100, "currency": "CNY"}'

signature = OpenSSL::HMAC.hexdigest("SHA256", api_secret, "#{timestamp}\n#{body}")

uri = URI("http://localhost:3000/api/v1/payment")
http = Net::HTTP.new(uri.host, uri.port)
request = Net::HTTP::Post.new(uri, "Content-Type" => "application/json")
request["X-App-Id"]      = app_id
request["X-Signature"]   = signature
request["X-Timestamp"]   = timestamp
request.body             = body

response = http.request(request)
puts response.body
```

#### Python 示例

```python
import hmac
import hashlib
import json
import time
import requests

app_id     = "my_app_id"
api_secret = "my_super_secret_key_123"
timestamp  = str(int(time.time()))
body       = json.dumps({"amount": 100, "currency": "CNY"})

signature = hmac.new(
    api_secret.encode(),
    f"{timestamp}\n{body}".encode(),
    hashlib.sha256
).hexdigest()

response = requests.post(
    "http://localhost:3000/api/v1/payment",
    data=body,
    headers={
        "X-App-Id": app_id,
        "X-Signature": signature,
        "X-Timestamp": timestamp,
        "Content-Type": "application/json",
    }
)
print(response.json())
```

#### Node.js 示例

```javascript
import crypto from 'crypto'

const appId     = 'my_app_id'
const apiSecret = 'my_super_secret_key_123'
const timestamp = Math.floor(Date.now() / 1000).toString()
const body      = JSON.stringify({ amount: 100, currency: 'CNY' })

const signature = crypto
  .createHmac('sha256', apiSecret)
  .update(`${timestamp}\n${body}`)
  .digest('hex')

const response = await fetch('http://localhost:3000/api/v1/payment', {
  method: 'POST',
  headers: {
    'X-App-Id': appId,
    'X-Signature': signature,
    'X-Timestamp': timestamp,
    'Content-Type': 'application/json',
  },
  body,
})
console.log(await response.json())
```

### 服务端验证流程

1. 检查 `X-App-Id`、`X-Signature`、`X-Timestamp` 三个请求头是否齐全
2. 检查时间戳偏差 ≤ 300 秒（5 分钟），防止重放攻击
3. 从 `credentials.yml.enc` 中查找 `app_id` 对应的 `api_secret`
4. 用相同算法计算期望签名，与请求中的签名做 `secure_compare`（恒定时间比较，防时序攻击）
5. 验证通过后，`current_api_app` 返回 `app_id`（注意：Signature 认证不绑定用户，而是标识调用方应用）

### 注意事项

- **GET 请求**：`request_body` 为空字符串，签名为 `HMAC-SHA256(secret, "#{timestamp}\n")`
- **密钥安全**：`api_secret` 切勿暴露在前端代码或公开仓库中
- **时钟同步**：客户端和服务器需保持时钟同步（NTP），否则时间戳校验会失败
- **无用户绑定**：Signature 认证标识的是「应用」而非「用户」，适合服务间调用

## 在控制器中选择认证方式

### 单一认证（必须通过指定方式）

```ruby
class Api::V1::PaymentController < ApiController
  include Api::SignatureAuthenticatable

  before_action { authenticate_only :signature }
end
```

### 混合认证（任一通过即可）

```ruby
class Api::V1::UsersController < ApiController
  include Api::ApiKeyAuthenticatable
  include Api::JwtAuthenticatable
  include Api::BearerTokenAuthenticatable

  before_action { authenticate_with :api_key, :jwt, :bearer_token }
end
```

### 无需认证

```ruby
class Api::V1::HealthController < ApiController
  def check
    render_success({ status: "ok" })
  end
end
```

## 认证方式选择指南

| 场景 | 推荐方式 | 原因 |
|------|---------|------|
| 前端 SPA | JWT | 用户登录后获取 token，有过期机制 |
| 移动端 App | JWT | 同上，且可刷新 |
| 服务间调用 | API Key | 无需登录，长期有效，可随时撤销 |
| 定时脚本 | API Key | 同上，适合自动化 |
| 支付接口 | Signature | 防篡改，高安全 |
| 第三方 webhook | Signature | 验证请求来源可信 |
| 公开数据 | 无认证 | 健康检查、元数据等 |
