# API 生成器

## 基本用法

```bash
rails generate zen:api ModelName field:type field:type
```

## 示例

```bash
rails generate zen:api Article title:string body:text status:string
```

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

      # ... create, update, destroy
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
