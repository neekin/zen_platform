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

或者使用命名卷：

```yaml
services:
  web:
    build: .
    volumes:
      - zen_storage:/rails/storage
      - zen_db:/rails/db

volumes:
  zen_storage:
  zen_db:
```

## MinIO 集成（推荐）

[MinIO](https://min.io/) 是 S3 兼容的对象存储，适合自托管部署。

### 1. 启动 MinIO

```yaml
# docker-compose.yml
services:
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"   # API 端口
      - "9001:9001"   # 管理控制台
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    volumes:
      - minio_data:/data

volumes:
  minio_data:
```

### 2. 创建存储桶

1. 访问 `http://localhost:9001` 打开 MinIO 控制台
2. 使用 `minioadmin / minioadmin123` 登录
3. 点击 "Buckets" → "Create Bucket"
4. 创建名为 `zen-platform` 的存储桶
5. 设置访问策略为 `public`（或按需配置）

### 3. 配置 Rails

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
  access_key_id: minioadmin
  secret_access_key: minioadmin123
  region: us-east-1
  bucket: zen-platform
  force_path_style: true  # MinIO 必须设置为 true
```

```ruby
# config/environments/production.rb
config.active_storage.service = :minio
```

### 4. 环境变量

生产环境建议通过环境变量配置敏感信息：

```yaml
# config/storage.yml
minio:
  service: S3
  endpoint: <%= ENV.fetch("MINIO_ENDPOINT", "http://localhost:9000") %>
  access_key_id: <%= ENV.fetch("MINIO_ACCESS_KEY", "minioadmin") %>
  secret_access_key: <%= ENV.fetch("MINIO_SECRET_KEY", "minioadmin123") %>
  region: <%= ENV.fetch("MINIO_REGION", "us-east-1") %>
  bucket: <%= ENV.fetch("MINIO_BUCKET", "zen-platform") %>
  force_path_style: true
```

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| `MINIO_ENDPOINT` | MinIO API 地址 | `http://localhost:9000` |
| `MINIO_ACCESS_KEY` | Access Key | `minioadmin` |
| `MINIO_SECRET_KEY` | Secret Key | `minioadmin123` |
| `MINIO_REGION` | 区域 | `us-east-1` |
| `MINIO_BUCKET` | 存储桶名称 | `zen-platform` |

### 5. 完整 docker-compose 示例

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
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin123
      MINIO_BUCKET: zen-platform
    depends_on:
      - db
      - minio
    volumes:
      - zen_db:/rails/db

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: password
    volumes:
      - zen_db:/var/lib/postgresql/data

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    volumes:
      - minio_data:/data

volumes:
  zen_db:
  minio_data:
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
