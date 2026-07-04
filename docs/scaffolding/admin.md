# Admin 生成器

## 基本用法

```bash
rails generate zen:admin ModelName field:type field:type [options]
```

## 示例

```bash
# 标准 CRUD（modal 模式）
rails generate zen:admin Article title:string body:text status:enum \
  --enums='{"status":["draft","published","archived"]}' \
  --modal

# 看板视图
rails generate zen:admin Task title:string status:enum \
  --enums='{"status":["todo","doing","done"]}' \
  --product=kanban

# 日历视图
rails generate zen:admin Event name:string start_date:date \
  --product=calendar

# 画廊视图
rails generate zen:admin Photo title:string cover:image \
  --product=gallery
```

## 选项

| 选项 | 说明 | 示例 |
|------|------|------|
| `--modal` | Modal 表单模式 | `--modal` |
| `--page` | 独立页面模式 | `--page` |
| `--rich_text` | 富文本字段 | `--rich-text=body` |
| `--image` | 图片上传字段 | `--image=cover` |
| `--file` | 文件上传字段 | `--file=attachment` |
| `--tags` | 标签字段 | `--tags=keywords` |
| `--enums` | 枚举值 (JSON) | `--enums='{"status":["draft","published"]}'` |
| `--belongs-to` | belongs_to 关联 | `--belongs-to=category` |
| `--has-many` | has_many 关联 | `--has-many=comments` |
| `--product` | 产品形态 | `--product=kanban` |

## 生成的文件

```
app/controllers/admin/posts_controller.rb
app/frontend/pages/admin/posts/Index.tsx
config/routes.rb (自动插入路由)
```

## 生成器会自动：

1. 使用 `zen_props` 传递 DSL 元数据
2. 使用 `policy_scope` 进行权限过滤
3. 使用 `authorize` 进行操作授权
4. 使用 DslTable + DslForm 动态渲染
