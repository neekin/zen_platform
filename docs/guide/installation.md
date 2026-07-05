---
title: 安装配置
---

# 安装配置

## 系统要求

| 依赖 | 版本要求 |
|------|-----------|
| Ruby | ≥ 4.0 |
| Rails | 8.1+ |
| Node.js | ≥ 20 |
| npm | ≥ 10 |
| SQLite3 | 3.4+（开发）/ PostgreSQL（生产） |

## 方式一：直接安装（推荐）

```bash
# 克隆仓库
git clone https://github.com/neekin/zen_platform.git
cd zen_platform

# 安装 Ruby 依赖
bundle install

# 安装 Node 依赖
npm install

# 初始化数据库
bin/rails db:setup

# 启动开发服务器
bin/dev
```

访问 `http://localhost:3100/admin`，使用以下账号登录：

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 超级管理员 | `admin@example.com` | `password123` |

## 方式二：Docker

```bash
docker compose up --build
```

访问 `http://localhost:3100/admin`

## 环境变量

创建 `.env` 文件（参考 `.env.example`）：

```bash
# CORS 允许的源
ALLOWED_ORIGINS=http://localhost:3100,http://localhost:3036

# 日志级别
RAILS_LOG_LEVEL=info

# API 签名密钥（通过 bin/rails credentials:edit 配置）
# api_secrets:
#   your_app_id: your_secret_key
```

## 常见问题

### Port 3000 被占用？

修改 `Procfile.dev` 第一行的端口号。

### npm install 失败？

确保 Node ≥ 24，并尝试：
```bash
npm install --legacy-peer-deps
```

### PaperTrail 兼容性警告？

PaperTrail 17.x 与 AR 8.1 有兼容性警告但功能正常，可忽略。

### 使用 puma-dev 域名访问？

如果你使用 [puma-dev](https://github.com/puma/puma-dev) 配置本地域名（如 `http://zen_platform.test`），需要修改两个配置文件：

**1. 添加域名到 host 白名单**

```ruby
# config/environments/development.rb
config.hosts << "zen_platform.test"
```

**2. 添加域名到 CORS 允许列表**

```ruby
# config/initializers/cors.rb
origins ENV.fetch("ALLOWED_ORIGINS", "http://localhost:3100,http://localhost:5173,http://zen_platform.test").split(",")
```

**3. 添加域名到 CSP connect_src**

```ruby
# config/initializers/content_security_policy.rb
policy.connect_src :self, :https, vite_host,
                   "ws://#{ViteRuby.config.host_with_port}",
                   "ws://localhost:3100", "ws://127.0.0.1:3100",
                   "ws://zen_platform.test", "http://zen_platform.test"
```

**4. 重启服务器**

```bash
touch tmp/restart.txt
```

**5. Inertia history encryption（如果页面报错 "Unable to encrypt history"）**

Inertia.js v2 默认启用 history encryption，需要 SSL。开发环境使用 HTTP 时需禁用：

```ruby
# config/initializers/inertia.rb
InertiaRails.configure do |config|
  config.encrypt_history = Rails.env.production?
end
```

::: tip 为什么需要这些配置？
- **hosts**: Rails 7+ 默认启用 host 授权，防止 DNS 重绑定攻击
- **CORS**: 跨域请求需要明确允许来源
- **CSP**: Content Security Policy 限制连接目标，WebSocket 需要单独配置
- **Inertia encryption**: 开发环境无 SSL，必须禁用 history encryption
:::
