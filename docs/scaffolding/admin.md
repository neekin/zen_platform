---
title: Admin 生成器
---

# Admin 生成器

`zen:admin` 生成完整的管理后台 CRUD 页面。

## 基本用法

```bash
rails generate zen:admin Article title:string body:rich_text status:enum
```

## 模式

### Modal 模式（默认）

列表和表单在同一个页面，表单以 Modal 弹出。

```bash
rails generate zen:admin Article --modal
```

适合字段较少（≤8 个）的模型。

### Page 模式

列表和表单是独立页面，表单在单独 URL。

```bash
rails generate zen:admin Article --page
```

适合字段较多或需要富文本编辑的模型。

## 选项

| 选项 | 说明 | 示例 |
|------|------|------|
| `--modal` | Modal 模式（默认） | `--modal` |
| `--page` | Page 模式 | `--page` |
| `--rich_text` | 富文本字段 | `--rich-text=body` |
| `--image` | 图片上传字段 | `--image=cover` |
| `--file` | 文件上传字段 | `--file=attachment` |
| `--tags` | 标签字段 | `--tags=keywords` |
| `--enums` | 枚举值 (JSON) | `--enums='{"status":["draft","published"]}'` |
| `--belongs-to` | belongs_to 关联 | `--belongs-to=category` |
| `--has-many` | has_many 关联 | `--has-many=comments` |
| `--product` | 产品形态 | `--product=kanban` |

## 枚举处理

```bash
rails generate zen:admin Article title:string status:enum \
  --enums='{"status":["draft","published","archived"]}'
```

生成器会自动在 Model 中添加 enum 声明（通过 DSL `field :status, :enum`）。

## 产品形态

```bash
rails generate zen:admin Task title:string status:enum \
  --enums='{"status":["todo","done"]}' \
  --product=kanban
```

支持形态：`crud`（默认）、`kanban`、`calendar`、`gallery`。

## 生成的 Controller

```ruby
# app/controllers/admin/articles_controller.rb
module Admin
  class ArticlesController < AdminController
    before_action :set_article, only: [:show, :update, :destroy]

    def index
      @articles = policy_scope(Article)
      render inertia: "admin/articles/Index",
        props: zen_props(Article, articles: @articles.as_json)
    end

    def create
      @article = Article.new(article_params)
      authorize @article
      # ...
    end
  end
end
```

生成器自动集成 `zen_props`（DSL 元数据）、`policy_scope`（Pundit 权限）、`authorize`。

## 分页、搜索、过滤

生成器自动集成 **Pagy**（分页）和 **Ransack**（搜索、过滤）。

### DSL 配置

在 Model 中配置：

```ruby
class User < ApplicationRecord
  include Zen::ModelDsl

  field :email, :string, required: true
  field :username, :string
  field :role, :enum, values: %w[admin editor viewer]

  display do
    list do
      paginate enabled: true          # 启用分页
      searchable :email, :username    # 启用搜索
      filterable :role                # 启用过滤
      column :email
      column :username
      column :role, badge: true
    end
  end
end
```

### 生成代码说明

#### 后端（Controller）

```ruby
# app/controllers/admin/users_controller.rb
class Admin::UsersController < AdminController
  include Pagy::Method

  def index
    q = User.ransack(search_params)
    base_query = q.result(distinct: true)
    @pagy, users = pagy(:offset, base_query, **pagy_params)

    render inertia: "admin/users/Index",
      props: zen_props(User, users: users.as_json,
        pagination: {
          page: @pagy.page,
          per_page: @pagy.limit,
          total: @pagy.count,
          pages: @pagy.pages
        }
      )
  end

  private

  def search_params
    params[:q]&.permit(:email_cont, :username_cont, :role_eq)
  end

  def pagy_params
    {
      page: params[:page] || 1,
      limit: params[:per_page] || 20
    }
  end
end
```

#### 前端（ProTable）

```tsx
// app/frontend/pages/admin/users/Index.tsx
<ProTable
  headerTitle="用户列表"
  search={{ placeholder: "搜索邮箱、用户名..." }}
  onChange={(pagination) => {
    router.get('/admin/users', {
      page: pagination.current,
      per_page: pagination.pageSize
    })
  }}
  columns={[
    {
      title: '角色',
      dataIndex: 'roles',
      filters: [
        { text: '管理员', value: 'admin' },
        { text: '编辑', value: 'editor' }
      ]
    }
  ]}
/>
```

### Ransack 谓词

| 谓词 | 说明 | 示例 |
|-------|------|------|
| `_cont` | 包含（模糊搜索） | `email_cont` |
| `_eq` | 等于（精确匹配） | `role_eq` |
| `_gteq` | 大于等于 | `created_at_gteq` |
| `_lteq` | 小于等于 | `created_at_lteq` |
| `_in` | 在列表中 | `status_in` |

### 自定义

如果不使用 DSL，可手动在 Controller 中添加：

```ruby
include Pagy::Method

def index
  q = Model.ransack(params[:q])
  @pagy, records = pagy(:offset, q.result, **pagy_params)
  # ...
end
```

## 添加菜单（必做）

生成器**不会**自动添加菜单项，需要手动配置。

1. 打开 `app/frontend/config/adminMenus.tsx`
2. 在 `menuRoutes.routes` 数组中添加菜单项：

```tsx
{
  path: '/admin/articles',
  name: '文章管理',
  icon: <FileTextOutlined />,
}
```

3. 在文件顶部 import 对应图标

> **提示**：不添加菜单项也能通过 URL 直接访问，但侧边栏不会显示入口。

## 自定义

生成后可直接编辑生成的文件。推荐方式：

1. 修改 Model DSL → 页面自动更新
2. 如需深度定制，直接编辑 `.tsx` 文件
