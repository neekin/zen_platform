---
title: Admin 二开指南
---

# Admin 二开指南

脚手架生成的 Admin CRUD 是基础代码，常见二次开发场景如下。

## 场景 1：自定义列表列

在 zen_meta 基础上追加自定义列：

```tsx
const customMeta = {
  ...meta,
  display: {
    ...meta.display,
    list: {
      columns: [
        ...meta.display.list.columns,
        { name: 'comment_count', render: (_: any, r: any) => <Tag>{r.comments?.length || 0}</Tag> }
      ]
    }
  }
}
<DslTable meta={customMeta} data={articles} basePath="/admin/articles" />
```

## 场景 2：添加自定义操作按钮

```tsx
<Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
<DslTable meta={meta} data={articles} basePath="/admin/articles" />
```

## 场景 3：权限控制

```tsx
<PermissionGuard roles={['admin', 'editor']}>
  <Button type="primary">新建文章</Button>
</PermissionGuard>
```

## 场景 4：自定义 Controller 逻辑

```ruby
def index
  @articles = policy_scope(Article).published
  render inertia: "admin/articles/Index",
    props: zen_props(Article, articles: @articles.as_json)
end
```

## 场景 5：按角色限制字段

```ruby
def article_params
  allowed = %i[title body status category]
  allowed << :internal_notes if current_user.has_role?(:admin)
  params.require(:article).permit(allowed)
end
```
