---
title: API 权限控制
---

# API 权限控制

认证（Authentication）解决的是"你是谁"，权限控制（Authorization）解决的是"你能做什么"。Zen Platform 的 API 层提供了灵活的权限控制机制。

## 认证 vs 权限

| 层级 | 机制 | 说明 |
|------|------|------|
| 认证 | JWT / API Key / Signature | 验证身份，确定 `@current_api_user` |
| 权限 | RBAC + Pundit | 验证操作权限，确定能否执行该操作 |

API 控制器默认只做认证，不做权限检查。你需要在业务代码中手动添加权限控制。

## 场景一：基于角色的粗粒度控制

最简单的方式——检查当前用户的角色：

```ruby
class Api::V1::ArticlesController < ApiController
  include Api::JwtAuthenticatable
  include Api::SwaggerDocControllable

  swagger_tag "文章管理"
  before_action { authenticate_with :jwt }

  def index
    render_success Article.all.as_json(only: %i[id title status])
  end

  def create
    # 只有 admin 和 editor 可以创建
    unless @current_api_user.has_any_role?(:super_admin, :admin, :editor)
      return render_error(message: "无权限", status: :forbidden)
    end

    article = Article.new(article_params)
    if article.save
      render_success article.as_json(only: %i[id title status])
    else
      render_error(message: article.errors.full_messages.join(", "))
    end
  end

  def destroy
    # 只有 admin 以上可以删除
    unless @current_api_user.has_any_role?(:super_admin, :admin)
      return render_error(message: "无权限", status: :forbidden)
    end

    article = Article.find_by(id: params[:id])
    if article
      article.destroy
      render_success
    else
      render_error(message: "记录不存在", status: :not_found)
    end
  end

  private

  def article_params
    params.require(:article).permit(:title, :body, :status)
  end
end
```

## 场景二：使用 RBAC 权限表

利用 `Permission.allowed?` 方法做细粒度权限检查：

```ruby
class Api::V1::ArticlesController < ApiController
  include Api::JwtAuthenticatable
  include Api::SwaggerDocControllable

  swagger_tag "文章管理"
  before_action { authenticate_with :jwt }
  before_action :check_permission, except: [:index, :show]

  def index
    render_success Article.all.as_json(only: %i[id title status])
  end

  def show
    article = Article.find_by(id: params[:id])
    if article
      render_success article.as_json(only: %i[id title body status])
    else
      render_error(message: "记录不存在", status: :not_found)
    end
  end

  def create
    article = Article.new(article_params)
    if article.save
      render_success article.as_json(only: %i[id title status])
    else
      render_error(message: article.errors.full_messages.join(", "))
    end
  end

  def update
    article = Article.find_by(id: params[:id])
    if article.nil?
      render_error(message: "记录不存在", status: :not_found)
    elsif article.update(article_params)
      render_success article.as_json(only: %i[id title status])
    else
      render_error(message: article.errors.full_messages.join(", "))
    end
  end

  def destroy
    article = Article.find_by(id: params[:id])
    if article
      article.destroy
      render_success
    else
      render_error(message: "记录不存在", status: :not_found)
    end
  end

  private

  # 统一权限检查
  def check_permission
    action_map = {
      "create" => "create",
      "update" => "update",
      "destroy" => "destroy"
    }

    action_name = action_map[params[:action]]
    return unless action_name

    @current_api_user.roles.each do |role|
      return if Permission.allowed?(role.name, "Article", action_name)
    end

    render_error(message: "无权限", status: :forbidden)
  end

  def article_params
    params.require(:article).permit(:title, :body, :status)
  end
end
```

权限在管理界面配置，`super_admin` 自动拥有所有权限（bypass），其他角色需要在权限管理 UI 中手动开启。

## 场景三：数据级权限（只看自己的数据）

限制用户只能操作自己的数据：

```ruby
class Api::V1::ArticlesController < ApiController
  include Api::JwtAuthenticatable
  include Api::SwaggerDocControllable

  swagger_tag "文章管理"
  before_action { authenticate_with :jwt }

  def index
    articles = scoped_articles
    render_success articles.as_json(only: %i[id title status published_at])
  end

  def show
    article = scoped_articles.find_by(id: params[:id])
    if article
      render_success article.as_json(only: %i[id title body status])
    else
      render_error(message: "记录不存在", status: :not_found)
    end
  end

  def update
    article = scoped_articles.find_by(id: params[:id])
    if article.nil?
      render_error(message: "记录不存在", status: :not_found)
    elsif article.update(article_params)
      render_success article.as_json(only: %i[id title status])
    else
      render_error(message: article.errors.full_messages.join(", "))
    end
  end

  private

  # 数据范围：admin 看全部，其他只看自己的
  def scoped_articles
    if @current_api_user.has_any_role?(:super_admin, :admin)
      Article.all
    else
      Article.where(user_id: @current_api_user.id)
    end
  end

  def article_params
    params.require(:article).permit(:title, :body, :status)
  end
end
```

## 场景四：使用 Pundit 策略

API 层也可以使用 Pundit（与 Admin 后台共用策略）：

```ruby
class Api::V1::ArticlesController < ApiController
  include Api::JwtAuthenticatable
  include Pundit::Authorization
  include Api::SwaggerDocControllable

  swagger_tag "文章管理"
  before_action { authenticate_with :jwt }

  def index
    # policy_scope 自动过滤当前用户可见的数据
    articles = policy_scope(Article)
    render_success articles.as_json(only: %i[id title status])
  end

  def show
    article = Article.find_by(id: params[:id])
    if article.nil?
      return render_error(message: "记录不存在", status: :not_found)
    end

    authorize article  # 检查 show 权限
    render_success article.as_json(only: %i[id title body status])
  end

  def create
    article = Article.new(article_params)
    article.user = @current_api_user
    authorize article  # 检查 create 权限

    if article.save
      render_success article.as_json(only: %i[id title status])
    else
      render_error(message: article.errors.full_messages.join(", "))
    end
  end

  def update
    article = Article.find_by(id: params[:id])
    if article.nil?
      return render_error(message: "记录不存在", status: :not_found)
    end

    authorize article  # 检查 update 权限
    if article.update(article_params)
      render_success article.as_json(only: %i[id title status])
    else
      render_error(message: article.errors.full_messages.join(", "))
    end
  end

  def destroy
    article = Article.find_by(id: params[:id])
    if article.nil?
      return render_error(message: "记录不存在", status: :not_found)
    end

    authorize article  # 检查 destroy 权限
    article.destroy
    render_success
  end

  rescue_from Pundit::NotAuthorizedError, with: :api_not_authorized

  private

  def api_not_authorized
    render_error(message: "无权限", status: :forbidden)
  end

  def article_params
    params.require(:article).permit(:title, :body, :status)
  end
end
```

对应的 Policy 文件：

```ruby
# app/policies/article_policy.rb
class ArticlePolicy < ApplicationPolicy
  def index?
    check_permission("index")
  end

  def show?
    check_permission("show")
  end

  def create?
    check_permission("create")
  end

  def update?
    check_permission("update")
  end

  def destroy?
    check_permission("destroy")
  end

  # 数据范围：admin 看全部，其他只看自己的
  class Scope < Scope
    def resolve
      if user.has_any_role?(:super_admin, :admin)
        scope.all
      else
        scope.where(user_id: user.id)
      end
    end
  end
end
```

## 场景五：API Key 绑定权限

API Key 可以绑定到特定用户，该用户的角色权限自动生效：

```ruby
class Api::V1::ArticlesController < ApiController
  include Api::ApiKeyAuthenticatable
  include Api::JwtAuthenticatable
  include Api::SwaggerDocControllable

  swagger_tag "文章管理"
  # API Key 和 JWT 都可以访问
  before_action { authenticate_with :api_key, :jwt }

  def create
    # @current_api_user 是 API Key 绑定的用户或 JWT 持有者
    # 检查该用户是否有 Article 的 create 权限
    unless has_permission?("Article", "create")
      return render_error(message: "无权限", status: :forbidden)
    end

    article = Article.new(article_params)
    article.user = @current_api_user
    if article.save
      render_success article.as_json(only: %i[id title status])
    else
      render_error(message: article.errors.full_messages.join(", "))
    end
  end

  private

  # 辅助方法：检查当前用户的权限
  def has_permission?(resource, action)
    @current_api_user.roles.any? do |role|
      Permission.allowed?(role.name, resource, action)
    end
  end
end
```

## 场景六：公开 vs 私有接口

部分接口公开访问，部分需要认证：

```ruby
class Api::V1::ArticlesController < ApiController
  include Api::JwtAuthenticatable
  include Api::ApiKeyAuthenticatable
  include Api::SwaggerDocControllable

  swagger_tag "文章管理"

  # 公开接口不需要认证，写操作需要 JWT 或 API Key
  before_action { authenticate_with :jwt, :api_key }, except: [:index, :show]

  def index
    # 公开接口：只返回已发布的文章
    render_success Article.published.as_json(only: %i[id title status published_at])
  end

  def show
    article = Article.published.find_by(id: params[:id])
    if article
      render_success article.as_json(only: %i[id title body status published_at])
    else
      render_error(message: "记录不存在", status: :not_found)
    end
  end

  # 以下接口需要认证
  def create
    unless has_permission?("Article", "create")
      return render_error(message: "无权限", status: :forbidden)
    end

    article = Article.new(article_params)
    if article.save
      render_success article.as_json(only: %i[id title status])
    else
      render_error(message: article.errors.full_messages.join(", "))
    end
  end

  private

  def has_permission?(resource, action)
    @current_api_user.roles.any? do |role|
      Permission.allowed?(role.name, resource, action)
    end
  end

  def article_params
    params.require(:article).permit(:title, :body, :status)
  end
end
```

## 认证策略选择指南

| 场景 | 认证方式 | 权限方式 | 示例 |
|------|---------|---------|------|
| 前端 SPA | JWT | 角色检查 | 用户登录后操作 |
| 服务间调用 | API Key | RBAC 权限表 | 后台服务读取数据 |
| 第三方接入 | API Key | 数据级隔离 | 每个 Key 绑定不同用户 |
| 支付/金融 | Signature | 强制签名 | 服务端到服务端 |
| 公开数据 | 无 | 无 | 已发布的文章列表 |
| 混合场景 | JWT + API Key | 按角色区分 | 既能前端调用也能服务调用 |

## 快速加固清单

脚手架生成 API 控制器后，按以下步骤添加权限控制：

1. **确定认证方式** — 在 `before_action` 中配置 `authenticate_with` 或 `authenticate_only`
2. **添加权限检查** — 写操作（create/update/destroy）添加 `Permission.allowed?` 检查
3. **数据隔离** — 如果需要，用 `scoped_xxx` 方法限制数据范围
4. **字段过滤** — 参考[字段过滤文档](./field-filtering)限制返回字段
5. **公开接口** — 如果部分接口需要公开，用 `except:` 排除认证
