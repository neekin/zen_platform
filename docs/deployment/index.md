---
title: 部署
---

# 部署指南

## 生产环境要求

| 组件 | 推荐 |
|------|------|
| Web 服务器 | Render / Fly.io / Heroku / VPS |
| 数据库 | PostgreSQL 15+ |
| 文件存储 | Active Storage + S3 / CloudFlare R2 |
| Ruby | 4.0+ |
| Node.js | 20+ |

## 部署方式

### Render.com（推荐）

1. Fork 仓库到 GitHub
2. 在 Render 创建 Web Service
3. 连接 GitHub 仓库
4. 设置环境变量（见下方）
5. 自动部署

配置文件 `render.yaml` 已包含在项目中。

### Docker

```bash
docker build -t zen_platform .
docker run -p 3000:3000 \
  -e RAILS_MASTER_KEY=<your-key> \
  -e RAILS_ENV=production \
  zen_platform
```

详见 [Docker 部署](./docker)

### Kamal

```bash
kamal setup
kamal deploy
```

## 环境变量（生产）

| 变量 | 说明 | 必填 |
|------|------|------|
| `RAILS_ENV` | 环境 | ✅ |
| `RAILS_MASTER_KEY` | Rails 主密钥 | ✅ |
| `DATABASE_URL` | 数据库连接 | ✅ |
| `ALLOWED_HOSTS` | 允许的主机 | ✅ |
| `ALLOWED_ORIGINS` | CORS 允许的源 | ❌ |

## 生成 RAILS_MASTER_KEY

```bash
bin/rails secret
```

或从 `config/master.key` 读取。

## 生产检查清单

- [ ] `RAILS_ENV=production`
- [ ] `RAILS_MASTER_KEY` 已设置
- [ ] `ALLOWED_HOSTS` 已配置
- [ ] 数据库已迁移 (`bin/rails db:migrate`)
- [ ] Seed 数据已导入 (`bin/rails db:seed`)
- [ ] SSL 已启用 (`config.force_ssl = true`)
- [ ] 日志级别已设置 (`RAILS_LOG_LEVEL=info`)
