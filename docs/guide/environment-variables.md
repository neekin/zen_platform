---
title: 环境变量参考
---

# 环境变量参考

## 数据库

| 变量 | 默认值 | 说明 |
|------|--------|------|
| DATABASE_URL | sqlite3:db/development.sqlite3 | 数据库连接字符串 |

## 认证

| 变量 | 默认值 | 说明 |
|------|--------|------|
| JWT_SECRET | (从 credentials 读取) | JWT 签名密钥 |
| SECRET_KEY_BASE | (Rails 生成) | Session Cookie 签名密钥 |

## CORS

| 变量 | 默认值 | 说明 |
|------|--------|------|
| ALLOWED_ORIGINS | (空) | CORS 允许的源，逗号分隔 |

::: warning 生产环境必须设置
生产环境必须设置 `ALLOWED_ORIGINS` 环境变量，否则 CORS 请求会被拒绝。

```bash
export ALLOWED_ORIGINS=https://your-domain.com
```

开发环境可创建 `.env.development` 文件：
```bash
ALLOWED_ORIGINS=http://localhost:3100,http://localhost:5173,http://your-dev-domain.test
```
:::

## 部署

| 变量 | 默认值 | 说明 |
|------|--------|------|
| RAILS_ENV | development | Rails 环境 |
| RAILS_MAX_THREADS | 5 | 最大线程数 |
| PORT | 3000 | 服务端口 |
| ALLOWED_HOSTS | localhost | 允许的主机名 |
| RAILS_LOG_LEVEL | info | 日志级别 |

## 文件存储（MinIO/S3）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| MINIO_ENDPOINT | `http://localhost:9000` | MinIO API 地址 |
| MINIO_ACCESS_KEY | - | Access Key |
| MINIO_SECRET_KEY | - | Secret Key |
| MINIO_REGION | us-east-1 | 区域 |
| MINIO_BUCKET | zen-platform | 存储桶名称 |

## 安全配置说明

### CSP（Content Security Policy）

- **生产环境**：使用 `nonce` 策略，禁止 `unsafe-inline`
- **开发环境**：允许 `unsafe_inline`（Vite HMR 需要）

### Inertia History Encryption

- **生产环境**：启用（需要 SSL）
- **开发环境**：禁用（HTTP 环境不支持）

### CORS

- 生产环境通过 `ALLOWED_ORIGINS` 环境变量控制
- 开发环境使用 `.env.development` 文件配置
- 未设置时默认拒绝所有跨域请求
