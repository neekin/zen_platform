---
title: API 生成器
---

# API 生成器

`zen:api` 生成符合 RESTful 规范的 JSON API 端点。

## 基本用法

```bash
rails generate zen:api Article
```

## 生成的端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/articles` | 列表 |
| GET | `/api/v1/articles/:id` | 详情 |
| POST | `/api/v1/articles` | 创建 |
| PATCH | `/api/v1/articles/:id` | 更新 |
| DELETE | `/api/v1/articles/:id` | 删除 |

## 生成的文件

```
app/controllers/api/v1/articles_controller.rb
spec/requests/api/v1/articles_spec.rb
config/routes.rb (自动插入路由)
```

## 生成的 Controller

```ruby
module Api
  module V1
    class ArticlesController < ApiController
      include Api::JwtAuthenticatable
      include Api::SwaggerDocControllable

      swagger_tag "文章管理"
      before_action { authenticate_with :jwt }

      def index
        render_success Article.all.as_json
      end

      def show
        article = Article.find(params[:id])
        render_success article.as_json
      end
    end
  end
end
```

## Swagger 文档

生成器自动创建 rswag spec，运行后生成 OpenAPI 文档：

```bash
bundle exec rspec spec/requests/api/v1/articles_spec.rb
```

访问 `/api-docs` 查看 Swagger UI。

## 认证

API 支持 4 种认证方式：

| 方式 | Header | 说明 |
|------|--------|------|
| JWT | `Authorization: Bearer <token>` | 推荐 |
| API Key | `X-Api-Key: <key>` | 服务间调用 |
| Bearer Token | `Authorization: Bearer <token>` | 简单场景 |
| Signature | `X-Signature: <sig>` | 高安全场景 |

## 元数据端点

```bash
GET /api/v1/meta/Article
```

返回 `zen_meta` JSON，供前端自动渲染。
