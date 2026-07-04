# 安装配置

## 环境要求

| 依赖 | 版本 |
|------|------|
| Ruby | 3.4+ |
| Node.js | 20+ |
| SQLite3 | 3.35+ |
| Bundler | 2.0+ |

## 安装步骤

```bash
# 克隆仓库
git clone https://github.com/yourusername/zen_platform.git
cd zen_platform

# 安装 Ruby 依赖
bundle install

# 安装 Node.js 依赖
npm install

# 初始化数据库
bin/rails db:create
bin/rails db:migrate
bin/rails db:seed

# 启动开发服务器
bin/dev
```

## 配置

### 环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

关键配置项：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `ALLOWED_ORIGINS` | CORS 允许的源 | `http://localhost:3000` |
| `RAILS_LOG_LEVEL` | 日志级别 | `info` |
| `ALLOWED_HOSTS` | 生产环境允许的主机 | — |

### 数据库

开发环境默认使用 SQLite3。生产环境建议切换到 PostgreSQL。

```yaml
# config/database.yml (生产环境)
production:
  adapter: postgresql
  url: <%= ENV["DATABASE_URL"] %>
```
