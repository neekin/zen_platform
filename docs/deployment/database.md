---
title: 数据库配置
---

# 数据库配置

Zen Platform 默认使用 SQLite3（零配置开发），生产环境支持切换 PostgreSQL。

## 默认配置（SQLite3）

开发环境零配置，`config/database.yml` 默认使用 SQLite3。

## 切换到 PostgreSQL

### 1. 修改 Gemfile

```ruby
# gem "sqlite3"
gem "pg", "~> 1.5"
```

运行 `bundle install`。

### 2. 修改 database.yml

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  host: <%= ENV.fetch("DB_HOST", "localhost") %>
  username: <%= ENV.fetch("DB_USERNAME", "postgres") %>
  password: <%= ENV.fetch("DB_PASSWORD", "") %>

production:
  primary:
    <<: *default
    database: <%= ENV.fetch("DB_NAME", "zen_production") %>
```

### 3. 环境变量

```bash
DB_HOST=localhost
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=zen_production
```

## Docker 中使用 PostgreSQL

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: zen_production
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - pg_data:/var/lib/postgresql/data
```
