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

## 二次开发指南

脚手架生成的是**基础 CRUD 代码**，只做了认证（你是谁），没有做权限控制（你能做什么）和字段过滤（返回什么）。生产环境使用前，必须进行二次开发。

### 脚手架代码的三个问题

| 问题 | 脚手架代码 | 风险 |
|------|-----------|------|
| 字段泄露 | `as_json` 无参数，返回所有字段 | 敏感字段（密码哈希、内部备注）暴露 |
| 无权限检查 | 只认证不鉴权，任何登录用户都能 CRUD | 普通用户能删除/修改他人数据 |
| 无数据隔离 | `Article.all` 返回全部数据 | 用户能看到不属于自己的数据 |

下面按步骤逐个解决。每一步都是独立的，你可以根据业务需求选择需要的部分。

### Step 1：字段过滤 — 限制返回字段

把 `as_json`（无参数）改为 `as_json(only: [...])` 白名单模式：

```ruby
# ❌ 脚手架生成的代码 — 返回所有字段
def index
  @articles = Article.all
  render_success @articles.as_json
end

# ✅ 改造后 — 只返回必要字段
def index
  @articles = Article.all
  render_success @articles.as_json(only: %i[id title status published_at])
end
```

详情接口可以比列表返回更多字段：

```ruby
def show
  @article = Article.find_by(id: params[:id])
  if @article
    render_success @article.as_json(only: %i[id title body status published_at created_at])
  else
    render_error(message: "记录不存在", status: :not_found)
  end
end
```

更多字段过滤方案（黑名单、关联嵌套、按角色动态过滤、Model 序列化方法），详见 [字段过滤文档](../api/field-filtering)。

### Step 2：权限控制 — 添加 RBAC 检查

写操作（create/update/destroy）添加权限检查，读操作（index/show）可选添加：

```ruby
class Api::V1::ArticlesController < ApiController
  include Api::JwtAuthenticatable
      include Api::SwaggerDocControllable

      swagger_tag "文章管理"
      before_action { authenticate_with :jwt }

      # 写操作统一检查权限
  before_action :check_permission, only: %i[create update destroy]

  def index
    render_success Article.all.as_json(only: %i[id title status published_at])
  end

  def show
    @article = Article.find_by(id: params[:id])
    if @article
      render_success @article.as_json(only: %i[id title body status published_at created_at])
    else
      render_error(message: "记录不存在", status: :not_found)
    end
  end

  def create
    @article = Article.new(article_params)
    if @article.save
      render_success @article.as_json(only: %i[id title status])
    else
      render_error(message: @article.errors.full_messages.join(", "))
    end
  end

  def update
    @article = Article.find_by(id: params[:id])
    if @article.nil?
      render_error(message: "记录不存在", status: :not_found)
    elsif @article.update(article_params)
      render_success @article.as_json(only: %i[id title status])
    else
      render_error(message: @article.errors.full_messages.join(", "))
    end
  end

  def destroy
    @article = Article.find_by(id: params[:id])
    if @article
      @article.destroy
      render_success
    else
      render_error(message: "记录不存在", status: :not_found)
    end
  end

  private

  # 统一权限检查：基于 RBAC 权限表
  def check_permission
    action_map = { "create" => "create", "update" => "update", "destroy" => "destroy" }
    action = action_map[params[:action]]
    return unless action

    # super_admin 自动通过（bypass），其他角色检查权限表
    @current_api_user.roles.each do |role|
      return if Permission.allowed?(role.name, "Article", action)
    end

    render_error(message: "无权限", status: :forbidden)
  end

  def article_params
    params.require(:article).permit(:title, :body, :status)
  end
end
```

权限在管理界面配置 — 脚手架生成模型时已自动注册到权限系统中，`super_admin` 自动拥有所有权限（bypass），其他角色在 **系统设置 → 权限管理** 中手动开启。

> **认证方式说明**：上面的示例用 JWT 认证。如果用 API Key 认证，把 `include Api::JwtAuthenticatable` 换成 `include Api::ApiKeyAuthenticatable`，`authenticate_with :jwt` 换成 `authenticate_with :api_key` 即可。详见 [认证方式文档](../api/authentication)。

### Step 3：数据隔离 — 限制数据范围

默认 `Article.all` 返回全部数据。如果需要按用户隔离：

```ruby
private

# admin 看全部，其他用户只看自己的
def scoped_articles
  if @current_api_user.has_role?(:super_admin, :admin)
    Article.all
  else
    Article.where(user_id: @current_api_user.id)
  end
end
```

然后把控制器中的 `Article.all` 和 `Article.find_by(id: ...)` 都改为通过 `scoped_articles`：

```ruby
def index
  render_success scoped_articles.as_json(only: %i[id title status published_at])
end

def show
  @article = scoped_articles.find_by(id: params[:id])
  # ... 其余不变
end

def update
  @article = scoped_articles.find_by(id: params[:id])
  # ... 其余不变
end

def destroy
  @article = scoped_articles.find_by(id: params[:id])
  # ... 其余不变
end
```

这样普通用户无法查看、修改、删除不属于自己的记录。

### Step 4：写入过滤 — 按角色限制可写字段

默认 `article_params` 允许所有字段写入。如果某些字段只允许管理员修改：

```ruby
def article_params
  allowed = %i[title body status]
  # 只有管理员能设置内部备注
  allowed << :internal_notes if @current_api_user.has_role?(:super_admin, :admin)
  params.require(:article).permit(allowed)
end
```

### Step 5：公开接口 — 部分接口免认证

如果列表和详情需要公开访问（如已发布文章），创建和修改需要登录：

```ruby
# 公开接口不需要认证
before_action { authenticate_with :jwt }, except: %i[index show]

def index
  # 公开接口只返回已发布的
  render_success Article.published.as_json(only: %i[id title status published_at])
end
```

### 完整改造示例

下面是一个完整的二次开发后的控制器，整合了上述所有步骤：

```ruby
module Api
  module V1
    class ArticlesController < ApiController
      include Api::JwtAuthenticatable
      include Api::ApiKeyAuthenticatable
      include Api::SwaggerDocControllable

      swagger_tag "文章管理"

      # 公开接口免认证，写操作需要 JWT 或 API Key
      before_action { authenticate_with :jwt, :api_key }, except: %i[index show]
      before_action :check_permission, only: %i[create update destroy]

      # GET /api/v1/articles — 公开，只返回已发布
      def index
        render_success Article.published.as_json(only: %i[id title status published_at])
      end

      # GET /api/v1/articles/:id — 公开，只返回已发布
      def show
        @article = Article.published.find_by(id: params[:id])
        if @article
          render_success @article.as_json(only: %i[id title body status published_at created_at])
        else
          render_error(message: "记录不存在", status: :not_found)
        end
      end

      # POST /api/v1/articles — 需认证 + create 权限
      def create
        @article = Article.new(article_params)
        @article.user = @current_api_user
        if @article.save
          render_success @article.as_json(only: %i[id title status])
        else
          render_error(message: @article.errors.full_messages.join(", "))
        end
      end

      # PATCH /api/v1/articles/:id — 需认证 + update 权限 + 数据隔离
      def update
        @article = scoped_articles.find_by(id: params[:id])
        if @article.nil?
          render_error(message: "记录不存在", status: :not_found)
        elsif @article.update(article_params)
          render_success @article.as_json(only: %i[id title status])
        else
          render_error(message: @article.errors.full_messages.join(", "))
        end
      end

      # DELETE /api/v1/articles/:id — 需认证 + destroy 权限 + 数据隔离
      def destroy
        @article = scoped_articles.find_by(id: params[:id])
        if @article
          @article.destroy
          render_success
        else
          render_error(message: "记录不存在", status: :not_found)
        end
      end

      private

      # 数据隔离：admin 看全部，其他只看自己的
      def scoped_articles
        @current_api_user.has_role?(:super_admin, :admin) ? Article.all : Article.where(user_id: @current_api_user.id)
      end

      # RBAC 权限检查
      def check_permission
        action_map = { "create" => "create", "update" => "update", "destroy" => "destroy" }
        action = action_map[params[:action]]
        return unless action

        @current_api_user.roles.each do |role|
          return if Permission.allowed?(role.name, "Article", action)
        end

        render_error(message: "无权限", status: :forbidden)
      end

      # 写入过滤：管理员可设置额外字段
      def article_params
        allowed = %i[title body status]
        allowed << :internal_notes if @current_api_user.has_role?(:super_admin, :admin)
        params.require(:article).permit(allowed)
      end
    end
  end
end
```

### 更多方案

上面的示例覆盖了最常见的场景。如果需要更高级的控制，参考以下文档：

| 需求 | 文档 | 说明 |
|------|------|------|
| 字段过滤（6 种方案） | [字段过滤](../api/field-filtering) | 白名单、黑名单、关联嵌套、按角色动态、Model 序列化、DSL 自动过滤 |
| 权限控制（6 种场景） | [权限控制](../api/permissions) | 角色检查、RBAC 表、数据级隔离、Pundit 策略、API Key 权限、公开/私有混合 |
| 认证方式（4 种） | [认证方式](../api/authentication) | JWT、API Key、Bearer Token、Signature 的获取和使用 |
| API Key 管理 | [认证方式 → API Key](../api/authentication#api-key) | Admin 后台创建 + 用户自助创建接口 |

### 改造清单

脚手架生成 API 控制器后，按顺序检查以下事项：

1. [ ] **字段过滤** — 所有 `as_json` 改为 `as_json(only: [...])` 白名单模式
2. [ ] **权限检查** — 写操作（create/update/destroy）添加 `check_permission`
3. [ ] **数据隔离** — 如果需要，用 `scoped_xxx` 方法限制数据范围
4. [ ] **写入过滤** — `xxx_params` 的 `permit` 列表按角色限制可写字段
5. [ ] **公开接口** — 如果部分接口需要公开，用 `except:` 排除认证
6. [ ] **Swagger 文档** — 确认生成的 rswag spec 与改造后的代码一致
