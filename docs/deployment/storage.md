---
title: 文件存储
---

# 文件存储

Zen Platform 使用 Rails Active Storage 处理文件上传（头像、图片、附件等）。默认使用本地磁盘存储，生产环境建议使用 MinIO 或 S3 兼容存储。

## 本地存储（默认）

开发环境默认存储在 `storage/` 目录。

### Docker 部署注意

使用 Docker 部署时，**必须挂载存储卷**，否则每次部署上传的文件会丢失：

```yaml
# docker-compose.yml
services:
  web:
    build: .
    volumes:
      - ./storage:/rails/storage    # ← 持久化上传文件
      - ./db:/rails/db              # ← 持久化数据库
    # ...
```

## MinIO 集成（推荐）

MinIO 是 S3 兼容的对象存储，适合自托管部署。

::: tip 为什么用 pgsty/minio？
官方 MinIO 镜像已移除 Web 控制台且不再维护。`pgsty/minio` 是社区维护的分支，内置 Web 管理界面，开箱即用。
:::

### 1. 启动 MinIO

```bash
docker run -d \
  --name minio \
  -p 9000:9000 \
  -e "MINIO_ROOT_USER=your_access_key" \
  -e "MINIO_ROOT_PASSWORD=your_secret_key" \
  -v /path/to/data:/data \
  pgsty/minio server /data
```

或使用 docker-compose：

```yaml
# docker-compose.yml
services:
  minio:
    image: pgsty/minio
    command: server /data
    ports:
      - "9000:9000"
    environment:
      MINIO_ROOT_USER: your_access_key
      MINIO_ROOT_PASSWORD: your_secret_key
    volumes:
      - minio_data:/data

volumes:
  minio_data:
```

### 2. 访问 Web 控制台

启动后访问 `http://localhost:9000`，使用设置的账号密码登录。

### 3. 创建存储桶

1. 登录 Web 控制台
2. 点击 "Buckets" → "Create Bucket"
3. 创建名为 `zen-platform` 的存储桶
4. 设置访问策略为 `public`（或按需配置）

### 4. 配置 Rails

添加 `aws-sdk-s3` gem：

```ruby
# Gemfile
gem "aws-sdk-s3", require: false
```

```bash
bundle install
```

配置 Active Storage：

```yaml
# config/storage.yml
minio:
  service: S3
  endpoint: http://localhost:9000
  access_key_id: your_access_key
  secret_access_key: your_secret_key
  region: us-east-1
  bucket: zen-platform
  force_path_style: true  # MinIO 必须设置为 true
```

```ruby
# config/environments/production.rb
config.active_storage.service = :minio
```

### 5. 环境变量

生产环境建议通过环境变量配置敏感信息：

```yaml
# config/storage.yml
minio:
  service: S3
  endpoint: <%= ENV.fetch("MINIO_ENDPOINT", "http://localhost:9000") %>
  access_key_id: <%= ENV.fetch("MINIO_ACCESS_KEY", "your_access_key") %>
  secret_access_key: <%= ENV.fetch("MINIO_SECRET_KEY", "your_secret_key") %>
  region: <%= ENV.fetch("MINIO_REGION", "us-east-1") %>
  bucket: <%= ENV.fetch("MINIO_BUCKET", "zen-platform") %>
  force_path_style: true
```

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| `MINIO_ENDPOINT` | MinIO API 地址 | `http://localhost:9000` |
| `MINIO_ACCESS_KEY` | Access Key | - |
| `MINIO_SECRET_KEY` | Secret Key | - |
| `MINIO_REGION` | 区域 | `us-east-1` |
| `MINIO_BUCKET` | 存储桶名称 | `zen-platform` |

### 6. 完整 docker-compose 示例

```yaml
# docker-compose.yml
version: "3.8"

services:
  web:
    build: .
    ports:
      - "3100:3100"
    environment:
      RAILS_ENV: production
      DATABASE_URL: postgresql://postgres:password@db:5432/zen_production
      MINIO_ENDPOINT: http://minio:9000
      MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY}
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY}
      MINIO_BUCKET: zen-platform
    depends_on:
      - db
      - minio
    volumes:
      - zen_storage:/rails/storage

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - zen_db:/var/lib/postgresql/data

  minio:
    image: pgsty/minio
    command: server /data
    ports:
      - "9000:9000"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio_data:/data

volumes:
  zen_storage:
  zen_db:
  minio_data:
```

创建 `.env` 文件：

```bash
# .env（不要提交到 git）
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
DB_PASSWORD=your_db_password
```

## S3 兼容服务

MinIO 配置同样适用于其他 S3 兼容服务：

| 服务 | endpoint 示例 |
|------|--------------|
| AWS S3 | `https://s3.amazonaws.com` |
| 阿里云 OSS | `https://oss-cn-hangzhou.aliyuncs.com` |
| 腾讯云 COS | `https://cos.ap-guangzhou.myqcloud.com` |
| Cloudflare R2 | `https://<account-id>.r2.cloudflarestorage.com` |

只需修改 `endpoint`、`access_key_id`、`secret_access_key` 和 `bucket` 即可。

## 文件迁移

从本地存储迁移到 MinIO：

```bash
# 迁移所有文件
bin/rails active_storage:migrate

# 或手动迁移特定记录
bin/rails console
ActiveStorage::Attachment.find_each do |attachment|
  attachment.blob.open do |file|
    attachment.blob.service.upload(attachment.blob.key, file)
  end
end
```
