---
title: 字段过滤
---

# 字段过滤

脚手架生成的 API 控制器默认返回模型的所有字段（`as_json` 无参数）。生产环境中必须根据业务需求限制返回字段，排除敏感信息。

## 问题：默认行为不安全

```ruby
# 脚手架生成的代码 — 返回所有字段
def index
  render_success Article.all.as_json
end
```

如果 `articles` 表包含 `internal_notes`、`deleted_at` 等内部字段，它们会被原样返回给客户端。

## 方案一：白名单模式（推荐）

使用 `as_json(only: ...)` 明确指定返回字段：

```ruby
def index
  render_success Article.all.as_json(only: %i[id title status published_at])
end

def show
  article = Article.find_by(id: params[:id])
  if article
    render_success article.as_json(only: %i[id title body status published_at created_at])
  else
    render_error(message: "记录不存在", status: :not_found)
  end
end
```

详情接口可以比列表接口返回更多字段（如 `body` 正文只在详情页返回）。

## 方案二：黑名单模式

使用 `as_json(except: ...)` 排除敏感字段：

```ruby
def index
  render_success Article.all.as_json(except: %i[internal_notes deleted_at admin_notes])
end
```

不推荐——新加字段时容易忘记添加到排除列表。

## 方案三：关联数据嵌套过滤

使用 `include` 返回关联数据，同时对关联对象做字段过滤：

```ruby
def show
  article = Article.find_by(id: params[:id])
  if article
    render_success article.as_json(
      only: %i[id title body status published_at],
      include: {
        category: { only: %i[id name] },
        comments: { only: %i[id content created_at] }
      }
    )
  else
    render_error(message: "记录不存在", status: :not_found)
  end
end
```

响应示例：

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "id": 1,
    "title": "文章标题",
    "body": "正文内容",
    "status": "published",
    "published_at": "2026-07-04T10:00:00.000Z",
    "category": { "id": 1, "name": "技术" },
    "comments": [
      { "id": 1, "content": "好文章", "created_at": "2026-07-04T11:00:00.000Z" }
    ]
  }
}
```

## 方案四：按角色动态过滤

根据当前用户的角色返回不同字段：

```ruby
class Api::V1::ArticlesController < ApiController
  include Api::JwtAuthenticatable
  include Api::SwaggerDocControllable

  swagger_tag "文章管理"
  before_action { authenticate_with :jwt }

  def index
    articles = Article.all
    render_success articles.as_json(only: public_fields)
  end

  def show
    article = Article.find_by(id: params[:id])
    if article
      render_success article.as_json(only: fields_for_current_user)
    else
      render_error(message: "记录不存在", status: :not_found)
    end
  end

  private

  # 根据角色返回不同字段
  def fields_for_current_user
    if @current_api_user.has_role?(:super_admin, :admin)
      %i[id title body status internal_notes admin_notes published_at created_at updated_at]
    else
      %i[id title body status published_at created_at]
    end
  end

  def public_fields
    %i[id title status published_at]
  end
end
```

## 方案五：提取到 Model 作为序列化方法

当多个控制器需要相同的字段过滤逻辑时，在模型中定义序列化方法：

```ruby
class Article < ApplicationRecord
  include Zen::ModelDsl

  field :title, :string, required: true
  field :body, :text
  field :status, :enum, values: %w[draft published archived], default: "draft"
  field :internal_notes, :text  # 内部字段，不对外暴露

  # API 公开字段（列表）
  def api_summary
    as_json(only: %i[id title status published_at])
  end

  # API 公开字段（详情）
  def api_detail
    as_json(
      only: %i[id title body status published_at created_at],
      include: { category: { only: %i[id name] } }
    )
  end

  # API 管理字段（含内部字段）
  def api_admin
    as_json(only: %i[id title body status internal_notes published_at created_at updated_at])
  end
end
```

控制器中使用：

```ruby
def index
  render_success Article.published.map(&:api_summary)
end

def show
  article = Article.find_by(id: params[:id])
  if article
    method = @current_api_user.has_role?(:super_admin, :admin) ? :api_admin : :api_detail
    render_success article.public_send(method)
  else
    render_error(message: "记录不存在", status: :not_found)
  end
end
```

## 结合 DSL 字段定义

利用 `zen_meta` 中已定义的 `zen_fields` 自动生成白名单：

```ruby
class Api::V1::ArticlesController < ApiController
  include Api::JwtAuthenticatable
  include Api::SwaggerDocControllable

  swagger_tag "文章管理"
  before_action { authenticate_with :jwt }

  # 从 DSL 定义自动提取 API 可暴露的字段
  # 排除标记为 internal: true 的字段
  def index
    fields = Article.zen_fields.reject { |_, opts| opts[:internal] }.keys
    render_success Article.all.as_json(only: fields)
  end

  def show
    article = Article.find_by(id: params[:id])
    if article
      fields = Article.zen_fields.reject { |_, opts| opts[:internal] }.keys
      render_success article.as_json(only: fields)
    else
      render_error(message: "记录不存在", status: :not_found)
    end
  end
end
```

模型定义中标记内部字段：

```ruby
class Article < ApplicationRecord
  include Zen::ModelDsl

  field :title, :string, required: true
  field :body, :text
  field :internal_notes, :text, internal: true  # 不会出现在 API 响应中
end
```

## 强参数（写入过滤）

字段过滤不仅限于读取，写入（创建/更新）同样需要控制。脚手架生成的 `params` 方法已经做了基本过滤：

```ruby
# 脚手架生成
def article_params
  params.require(:article).permit(:title, :body, :status)
end
```

如果需要按角色限制可写入的字段：

```ruby
def article_params
  allowed = %i[title body status]
  allowed << :internal_notes if @current_api_user.has_role?(:super_admin, :admin)
  params.require(:article).permit(allowed)
end
```

## 快速加固清单

脚手架生成 API 控制器后，按以下步骤加固：

1. **`index`** — 把 `as_json` 改为 `as_json(only: [...])`，只返回列表需要的字段
2. **`show`** — 同上，可以比 `index` 多返回几个字段
3. **`create`/`update`** — 检查 `xxx_params` 方法，确认 `permit` 列表不含敏感字段
4. **关联数据** — 如果返回关联，用 `include: { model: { only: [...] } }` 限制嵌套字段
5. **敏感字段** — 密码、密钥、内部备注等字段绝不能出现在 API 响应中
