# Docker 部署

## 快速启动

```bash
# 构建镜像
docker build -t zen_platform .

# 运行
docker run -d -p 3000:3000 \
  -e RAILS_MASTER_KEY=<your-master-key> \
  -e RAILS_ENV=production \
  --name zen_platform \
  zen_platform
```

## Docker Compose

```bash
# 启动
docker compose up -d

# 查看日志
docker compose logs -f

# 停止
docker compose down
```

## 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `RAILS_MASTER_KEY` | Rails 主密钥 | ✅ |
| `RAILS_ENV` | 环境 | ✅ |
| `DATABASE_URL` | 数据库连接 | ❌ (默认 SQLite) |
| `ALLOWED_HOSTS` | 允许的主机 | ❌ |

## 生产环境建议

1. 切换到 PostgreSQL
2. 配置 CDN
3. 启用 SSL
4. 配置日志收集
5. 设置监控告警
