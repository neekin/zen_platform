# Zen Platform

一个基于 Rails 8 + Inertia.js + React 的现代化 Web 应用平台。

## 项目特点

### 🚀 技术栈

- **后端**: Ruby on Rails 8.1
- **前端**: React + TypeScript + Vite
- **UI 框架**: Ant Design Pro
- **数据库**: SQLite3 (开发) / PostgreSQL (生产)
- **认证**: JWT + API Key + Bearer Token + HMAC 签名
- **API 文档**: Swagger/OpenAPI (rswag)

### 🔐 多种认证方式

| 认证方式 | 说明 | 使用场景 |
|---------|------|---------|
| JWT | JSON Web Token | 移动端、SPA 应用 |
| API Key | X-Api-Key 请求头 | 服务端对接 |
| Bearer Token | Authorization: Bearer | 简单认证 |
| HMAC 签名 | X-Signature + X-Timestamp | 支付等敏感操作 |

### 🛠 自定义脚手架

项目提供了自定义的脚手架生成器，可以快速生成 Admin 后台和 API 接口代码。

## 快速开始

### 1. 安装依赖

```bash
# 安装 Ruby 依赖
bundle install

# 安装前端依赖
npm install
```

### 2. 数据库初始化

```bash
# 创建数据库
bin/rails db:create

# 运行迁移
bin/rails db:migrate

# 填充测试数据（可选）
bin/rails db:seed
```

### 3. 启动开发服务器

```bash
# 启动所有服务（Rails + Vite）
bin/dev

# 或者分别启动
bin/rails server    # Rails 服务器 (http://localhost:3000)
bin/vite dev        # Vite 开发服务器
```

## 使用脚手架生成器

### Admin 脚手架

生成管理后台的 CRUD 功能，包括控制器和 React 页面。

```bash
# 基本用法
rails generate zen:admin ModelName field1:type field2:type

# 示例：生成文章管理
rails generate zen:admin Article title:string body:text status:integer

# 生成的文件：
# - app/controllers/admin/articles_controller.rb
# - app/frontend/pages/admin/articles/Index.tsx
# - app/frontend/pages/admin/articles/Show.tsx
# - app/frontend/pages/admin/articles/New.tsx
# - app/frontend/pages/admin/articles/Edit.tsx
# - config/routes.rb（自动添加路由）
```

### API 脚手架

生成 API 接口，包括控制器和 Swagger 测试文件。

```bash
# 基本用法
rails generate zen:api ModelName field1:type field2:type

# 示例：生成文章 API
rails generate zen:api Article title:string body:text status:integer

# 生成的文件：
# - app/controllers/api/v1/articles_controller.rb
# - spec/requests/api/v1/articles_spec.rb
# - config/routes.rb（自动添加路由）
```

### 生成 Swagger 文档

```bash
# 运行 rswag 测试并生成 Swagger 文档
bundle exec rspec spec/requests/api/v1/ --format Rswag::Specs::SwaggerFormatter --format documentation

# 访问 Swagger UI
open http://localhost:3000/api-docs
```

### 脚手架生成代码说明

脚手架生成的代码都带有详细的注释，方便开发者理解和修改：

#### Admin 控制器注释示例
```ruby
# <%= class_name %> 管理控制器
# 用于 Admin 后台的 CRUD 操作
# 对应的 React 页面位于: app/frontend/pages/admin/<%= plural_name %>/
module Admin
  class <%= class_name.pluralize %>Controller < AdminController
    # 需要登录才能访问
    before_action :require_login

    # GET /admin/<%= plural_name %>
    # 列表页，显示所有 <%= class_name %> 记录
    # Props: { <%= plural_name %>: Array }
    def index
      # ...
    end
  end
end
```

#### React 页面注释示例
```tsx
/**
 * <%= class_name %> 列表页
 * 路由: /admin/<%= plural_name %>
 *
 * Props (从控制器传入):
 * - <%= plural_name %>: <%= class_name %>[] - <%= class_name %> 列表数据
 *
 * 功能:
 * - 显示 <%= class_name %> 列表（使用 ProTable 组件）
 * - 支持查看、编辑、删除操作
 */
```

#### API 控制器注释示例
```ruby
# <%= class_name %> API 控制器
# 提供 RESTful JSON API 接口
# Swagger 文档会自动生成，访问: /api-docs
module Api
  module V1
    class <%= class_name.pluralize %>Controller < ApiController
      # JWT 认证模块
      include Api::JwtAuthenticatable

      # GET /api/v1/<%= plural_name %>
      # 获取所有记录
      # 响应: { code: 0, message: "成功", data: [...] }
      def index
        # ...
      end
    end
  end
end
```

## API 认证

### JWT 认证

```bash
# 1. 登录获取 JWT Token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -d "account=user@example.com&password=password123"

# 响应：
# {
#   "code": 0,
#   "message": "成功",
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiJ9...",
#     "user": { "id": 1, "username": "user", ... }
#   }
# }

# 2. 使用 JWT Token 访问 API
curl http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

### API Key 认证

```bash
# 1. 在 Admin 后台创建 API Key
# 2. 使用 API Key 访问
curl http://localhost:3000/api/v1/users \
  -H "X-Api-Key: your_api_key_here"
```

### HMAC 签名认证

```bash
# 生成签名
TIMESTAMP=$(date +%s)
SECRET="your_api_secret"
BODY='{"amount":100}'
SIGNATURE=$(echo -ne "${TIMESTAMP}\n${BODY}" | openssl dgst -sha256 -hmac "${SECRET}" | awk '{print $2}')

# 发送请求
curl -X POST http://localhost:3000/api/v1/payment \
  -H "X-App-Id: your_app_id" \
  -H "X-Timestamp: ${TIMESTAMP}" \
  -H "X-Signature: ${SIGNATURE}" \
  -H "Content-Type: application/json" \
  -d "${BODY}"
```

## 项目结构

```
zen_platform/
├── app/
│   ├── controllers/
│   │   ├── admin_controller.rb          # Admin 基类
│   │   ├── api_controller.rb            # API 基类
│   │   ├── admin/                       # Admin 控制器
│   │   ├── api/v1/                      # API 控制器
│   │   └── concerns/api/                # API 认证模块
│   ├── frontend/
│   │   ├── pages/admin/                 # Admin React 页面
│   │   ├── layouts/                     # 布局组件
│   │   └── entrypoints/                 # 入口文件
│   └── models/                          # 数据模型
├── config/
│   ├── routes.rb                        # 路由配置
│   └── initializers/                    # 初始化配置
├── lib/
│   └── generators/                      # 自定义生成器
│       └── zen/
│           ├── admin_generator.rb       # Admin 脚手架
│           └── api_generator.rb         # API 脚手架
├── spec/
│   └── requests/api/v1/                 # rswag 测试
└── swagger/                             # Swagger 文档
    └── v1/swagger.json
```

## 测试

### 运行所有测试

```bash
# 运行 Minitest 测试
bin/rails test

# 运行 rswag 测试
bundle exec rspec spec/requests/api/v1/
```

### 生成测试覆盖率

```bash
# 使用 SimpleCov（如果配置了）
bin/rails test
open coverage/index.html
```

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t zen_platform .

# 运行容器
docker run -p 3000:3000 -e RAILS_ENV=production zen_platform
```

### Kamal 部署

```bash
# 配置部署信息
kamal setup

# 部署
kamal deploy
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|-------|------|-------|
| `RAILS_ENV` | 运行环境 | `development` |
| `SECRET_KEY_BASE` | Rails 密钥 | - |
| `DATABASE_URL` | 数据库连接 | `sqlite3:db/*.sqlite3` |
| `JWT_SECRET` | JWT 密钥 | 使用 Rails secret_key_base |

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目主页: https://github.com/yourusername/zen_platform
- 问题反馈: https://github.com/yourusername/zen_platform/issues

## 致谢

- [Ruby on Rails](https://rubyonrails.org/)
- [React](https://react.dev/)
- [Ant Design Pro](https://pro.ant.design/)
- [Inertia.js](https://inertiajs.com/)
- [rswag](https://github.com/rswag/rswag)
