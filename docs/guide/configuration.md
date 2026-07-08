---
title: 配置参考
---

# 配置参考

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `ALLOWED_ORIGINS` | `http://localhost:3100,http://localhost:3036` | CORS 允许的源 |
| `RAILS_LOG_LEVEL` | `info` | 日志级别 |
| `RAILS_MAX_THREADS` | `5` | 最大线程数 |
| `DB_HOST` | `localhost` | PostgreSQL 主机 |
| `DB_USERNAME` | `postgres` | PostgreSQL 用户名 |
| `DB_PASSWORD` | - | PostgreSQL 密码 |
| `DB_NAME` | `zen_production` | PostgreSQL 数据库名 |

## Rails Credentials

通过 `bin/rails credentials:edit` 配置敏感信息：

```yaml
api_secrets:
  your_app_id: your_secret_key  # API Signature 认证密钥
```

## API 认证配置

### JWT

默认启用，无需额外配置。Token 有效期 24 小时。

### API Key

在 Admin 后台 **系统设置 → API Key** 创建。

### Signature

通过 `bin/rails credentials:edit` 配置 `api_secrets`。

## 文件上传

默认使用本地存储（`storage/` 目录）。生产环境建议配置云存储。

## CSRF / CORS

- CSRF 默认启用
- CORS 通过 `ALLOWED_ORIGINS` 环境变量配置
