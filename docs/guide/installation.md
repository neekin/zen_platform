---
title: 安装配置
---

# 安装配置

## 系统要求

| 依赖 | 版本要求 |
|------|-----------|
| Ruby | ≥ 3.4 |
| Rails | 8.1+ |
| Node.js | ≥ 20 |
| npm | ≥ 10 |
| SQLite3 | 3.4+（开发）/ PostgreSQL（生产） |

## 方式一：直接安装（推荐）

```bash
# 克隆仓库
git clone https://github.com/yourusername/zen_platform.git
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

访问 `http://localhost:3000/admin`

## 环境变量

创建 `.env` 文件（参考 `.env.example`）：

```bash
# CORS 允许的源
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# 日志级别
RAILS_LOG_LEVEL=info

# API 签名密钥（通过 bin/rails credentials:edit 配置）
# api_secrets:
#   your_app_id: your_secret_key
```

## 常见问题

### Port 3100 被占用？

修改 `Procfile.dev` 第一行的端口号。

### npm install 失败？

确保 Node ≥ 20，并尝试：
```bash
npm install --legacy-peer-deps
```

### PaperTrail 兼容性警告？

PaperTrail 16.x 与 AR 8.1 有兼容性警告但功能正常，可忽略。
