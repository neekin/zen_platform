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
| ALLOWED_ORIGINS | http://localhost:3000,http://localhost:5173 | CORS 允许的源 |

## 部署

| 变量 | 默认值 | 说明 |
|------|--------|------|
| RAILS_ENV | development | Rails 环境 |
| RAILS_MAX_THREADS | 5 | 最大线程数 |
| PORT | 3000 | 服务端口 |
| ALLOWED_HOSTS | localhost | 允许的主机名 |
| RAILS_LOG_LEVEL | info | 日志级别 |
