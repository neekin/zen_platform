---
title: Docker 部署
---

# Docker 部署

## 使用 docker-compose（推荐用于本地 Demo）

```bash
# 构建并启动
docker compose up --build

# 访问
open http://localhost:3100/admin
```

`docker-compose.yml` 包含：
- Rails 应用（Puma）
- SQLite3 数据库（开发环境）
- 持久化存储卷

## 生产 Docker 构建

```bash
# 构建镜像
docker build -t zen_platform .

# 运行
docker run -d -p 3000:3000 \
  -e RAILS_MASTER_KEY=<your-master-key> \
  -e RAILS_ENV=production \
  -e DATABASE_URL=postgresql://... \
  --name zen_platform \
  zen_platform
```

## 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `RAILS_MASTER_KEY` | Rails 主密钥 | ✅ |
| `RAILS_ENV` | 环境 | ✅ |
| `DATABASE_URL` | 数据库连接 | ❌ (默认 SQLite) |
| `ALLOWED_HOSTS` | 允许的主机 | ❌ |

## Render 一键部署

Fork 仓库后，在 Render 创建 Web Service 连接 GitHub 仓库即可。

配置文件 `render.yaml` 已包含在项目中，Render 会自动识别。

## 生产环境建议

1. 切换到 PostgreSQL
2. 配置 CDN
3. 启用 SSL
4. 配置日志收集
5. 设置监控告警
6. 使用 [MinIO 或 S3 存储文件](/deployment/storage)

## ⚠️ 持久化存储

**Docker 部署必须挂载存储卷**，否则每次部署上传的文件（头像、图片、附件）会丢失：

```yaml
# docker-compose.yml
services:
  web:
    volumes:
      - ./storage:/rails/storage    # ← 持久化上传文件
      - ./db:/rails/db              # ← 持久化数据库
```

详见 [文件存储](/deployment/storage) 文档。
