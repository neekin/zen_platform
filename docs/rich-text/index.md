---
title: 富文本编辑器
---

# 富文本编辑器

Zen Platform 内置基于 Lexical 的富文本编辑器，开箱即用 20+ 个插件。编辑器深度集成 Rails Active Storage，支持图片/文件上传、Mermaid 图表、KaTeX 数学公式等高级功能。

## 快速使用

根据你的场景选择使用方式：

### 方式一：脚手架生成器（推荐）

```bash
# 生成模型 + Admin CRUD 页面
rails generate zen:admin Article title:string body:text --rich-text=body --modal

# 运行迁移
bin/rails db:migrate
```

生成器会自动：
- 创建 Model 并声明 `field :body, :rich_text`
- 创建 CRUD 页面（表单用编辑器，详情用查看器）
- 创建 Controller 和 Policy

### 方式二：已有模型手动添加

```ruby
# app/models/article.rb
class Article < ApplicationRecord
  include Zen::ModelDsl

  field :title, :string, required: true
  field :body, :rich_text  # ← 添加这一行
end
```

声明 `:rich_text` 后，脚手架页面自动：
- 表单中渲染富文本编辑器（可编辑）
- 详情页渲染只读查看器（只读）

## 视图渲染

富文本内容以 **Lexical JSON** 格式存储在数据库中。根据不同视图类型，选择对应的渲染方式：

### React / Inertia 页面（Admin 后台）

Admin 后台使用 Inertia + React，直接使用前端组件渲染：

```tsx
import { RichTextEditor, RichTextViewer } from '@/modules/content'

// 编辑模式（表单）
<RichTextEditor
  value={content}
  onChange={setContent}
  toolbar={['bold', 'italic', 'heading', 'link', 'image']}
/>

// 只读模式（详情页）
<RichTextViewer content={article.body} />
```

### ERB 页面（公开页面）

公开页面使用 ERB 模板，需要服务端渲染 HTML：

#### 1. 添加样式

在 Layout 的 `<head>` 中添加富文本样式：

```erb
<!-- app/views/layouts/application.html.erb -->
<head>
  <%= rich_text_styles %>
  <!-- 其他 head 内容 -->
</head>
```

#### 2. 渲染内容

```erb
<!-- app/views/articles/show.html.erb -->
<div class="rich-text-content">
  <%= rich_text_html(@article.body) %>
</div>
```

#### 3. Helper 方法

| 方法 | 用途 | 返回值 |
|------|------|--------|
| `rich_text_html(content)` | Lexical JSON → HTML | HTML 字符串 |
| `rich_text_styles` | 生成 CSS 样式 | `<style>` 标签 |

### 对比表

| 视图类型 | 渲染方式 | 编辑 | 只读展示 |
|---------|---------|------|---------|
| React/Inertia (Admin) | `RichTextEditor` | ✅ | `RichTextViewer` |
| ERB (公开页面) | 服务端渲染 | ❌ | `rich_text_html` |

## 编辑器配置

### 工具栏

```tsx
// 默认工具栏（推荐）
<RichTextEditor
  toolbar={['bold', 'italic', 'underline', 'heading', 'quote', 'bullet-list', 'numbered-list', 'link', 'image']}
/>

// 精简工具栏
<RichTextEditor
  toolbar={['bold', 'italic', 'heading', 'link']}
/>

// 完整工具栏（所有插件）
<RichTextEditor
  toolbar={['bold', 'italic', 'underline', 'strikethrough', 'code', 'heading', 'quote', 'bullet-list', 'numbered-list', 'link', 'image', 'table', 'code-block', 'mermaid', 'math']}
/>
```

可用 toolbar ID：`bold`, `italic`, `underline`, `strikethrough`, `code`, `heading`, `quote`, `bullet-list`, `numbered-list`, `link`, `image`, `table`, `code-block`, `mermaid`, `math`, `video`, `attachment`, `mention`, `emoji`

### 上传器

```tsx
import { ActiveStorageUploader } from '@/modules/content'

const uploader = new ActiveStorageUploader({
  accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: 10 * 1024 * 1024, // 10MB
})

<RichTextEditor uploader={uploader} />
```

### 只读模式

```tsx
<RichTextEditor value={content} readOnly />
// 或
<RichTextViewer content={content} />
```

## 支持的文本格式

| 格式 | 快捷键 | 说明 |
|------|--------|------|
| 加粗 | Ctrl+B | 文本加粗 |
| 斜体 | Ctrl+I | 文本斜体 |
| 下划线 | Ctrl+U | 文本下划线 |
| 删除线 | Ctrl+Shift+X | 文本删除线 |
| 字体颜色 | - | ColorPicker 选择 |
| 背景色 | - | ColorPicker 选择 |
| 字体大小 | - | 12px-36px |
| 文本对齐 | - | 居左/居中/居右/平铺 |

## 内容格式说明

编辑器内容以 **Lexical JSON** 格式存储（不是 HTML）：

```json
{
  "root": {
    "children": [
      {
        "children": [
          { "type": "text", "text": "Hello World", "format": 1 }
        ],
        "type": "paragraph"
      }
    ],
    "type": "root"
  }
}
```

**为什么不用 HTML？**
- 保留完整编辑器状态（格式、节点类型、嵌套结构）
- 支持 DecoratorNode（Mermaid/KaTeX/Video 等富内容节点）
- 前端用 `RichTextViewer` 直接渲染 JSON，无需 HTML 解析
- 后端用 `rich_text_html` Helper 渲染为 HTML（用于 ERB）

## 下一步

- [内置插件](/rich-text/plugins) — 20+ 个插件详细功能说明
- [自定义插件](/rich-text/custom-plugin) — 开发自己的插件
