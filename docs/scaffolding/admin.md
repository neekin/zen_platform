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
