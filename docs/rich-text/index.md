---
title: 富文本编辑器
---

# 富文本编辑器

Zen Platform 内置基于 Lexical 的富文本编辑器，开箱即用 20 个插件。编辑器深度集成 Rails Active Storage，支持图片/文件上传、Mermaid 图表、KaTeX 数学公式等高级功能。

## 快速使用

有两种使用方式，根据你的场景选择：

### 方式一：新模型 — 用脚手架生成器（推荐）

如果你还没有 Article 模型，用生成器一步到位：

```bash
# 生成模型 + Admin CRUD 页面
# --rich_text=body 指定 body 字段使用富文本编辑器
rails generate zen:admin Article title:string body:text --rich_text=body --modal

# 运行迁移
bin/rails db:migrate
```

生成器会自动创建 `app/models/article.rb`，其中 `body` 字段通过 `--rich_text` 选项标记为富文本，前端页面自动渲染为富文本编辑器。

打开 `http://localhost:3100/admin/articles`，点击"新建文章"，你会看到：
- **标题** — 普通文本输入框
- **内容** — 富文本编辑器（支持加粗、标题、图片、链接等）

### 方式二：已有模型 — 手动添加字段

如果你已经有 Article 模型，只需在 Model 中声明 `rich_text` 类型的字段：

```ruby
# app/models/article.rb
class Article < ApplicationRecord
  include Zen::ModelDsl

  field :title, :string, required: true
  field :body, :rich_text  # ← 添加这一行
end
```

声明 `:rich_text` 后，已有的 CRUD 页面会自动：
- 表单中渲染富文本编辑器（可编辑）
- 列表/详情中渲染只读查看器（只读）

### 方式三：在自定义页面中使用

如果你需要在非脚手架页面中使用编辑器：

```tsx
import { RichTextEditor, RichTextViewer, ActiveStorageUploader } from '@/modules/content'

// 1. 创建上传器（用于图片/文件上传）
const uploader = new ActiveStorageUploader({
  accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: 10 * 1024 * 1024, // 10MB
})

// 2. 在组件中使用
function ArticleForm() {
  const [content, setContent] = useState('{}')

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      toolbar={['bold', 'italic', 'heading', 'link', 'image']}
      uploader={uploader}
      placeholder="开始写作..."
    />
  )
}

// 3. 只读展示
function ArticleView({ article }) {
  return <RichTextViewer content={article.body} />
}
```

## 配置

### 工具栏配置

通过 `toolbar` 属性控制显示哪些工具栏按钮：

```tsx
// 默认工具栏（推荐，覆盖常用功能）
<RichTextEditor
  toolbar={['bold', 'italic', 'underline', 'heading', 'quote', 'bullet-list', 'numbered-list', 'link', 'image']}
/>

// 精简工具栏（只保留基础格式）
<RichTextEditor
  toolbar={['bold', 'italic', 'heading', 'link']}
/>

// 完整工具栏（包含所有 20 个插件）
<RichTextEditor
  toolbar={['bold', 'italic', 'underline', 'strikethrough', 'code', 'heading', 'quote', 'bullet-list', 'numbered-list', 'link', 'image', 'table', 'code-block', 'mermaid', 'math']}
/>
```

可用的 toolbar ID：`bold`, `italic`, `underline`, `strikethrough`, `code`, `heading`, `quote`, `bullet-list`, `numbered-list`, `link`, `image`, `table`, `code-block`, `mermaid`, `math`, `video`, `attachment`, `mention`, `emoji`

### 上传器配置

编辑器需要上传器才能支持图片/文件上传：

```tsx
import { ActiveStorageUploader } from '@/modules/content'

// 图片上传器
const imageUploader = new ActiveStorageUploader({
  accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: 10 * 1024 * 1024, // 10MB
})

// 文件上传器
const fileUploader = new ActiveStorageUploader({
  accept: ['application/pdf', 'application/zip', 'application/msword'],
  maxSize: 50 * 1024 * 1024, // 50MB
})

// 使用
<RichTextEditor uploader={imageUploader} />
```

### 占位符

```tsx
<RichTextEditor placeholder="请输入文章内容..." />
```

### 只读模式

```tsx
<RichTextEditor value={content} readOnly />
// 或使用专用查看器
<RichTextViewer content={content} />
```

### 方式五：在 ERB 模板中渲染

如果需要在 ERB（非 Inertia）页面中显示富文本内容，使用 `RichTextHelper`：

#### 1. 在 Layout 中添加样式

```erb
<!-- app/views/layouts/application.html.erb -->
<head>
  <%= rich_text_styles %>
</head>
```

#### 2. 在 View 中渲染内容

```erb
<!-- app/views/articles/show.html.erb -->
<div class="rich-text-content">
  <%= rich_text_html(@article.body) %>
</div>
```

#### 3. Helper 方法说明

| 方法 | 用途 |
|------|------|
| `rich_text_html(content)` | 将 Lexical JSON 渲染为 HTML |
| `rich_text_styles` | 生成富文本所需的 CSS 样式 |

#### 4. 支持的格式

- 加粗、斜体、下划线、删除线
- 标题（H1-H3）
- 列表（有序/无序）
- 引用
- 代码块
- 链接、图片
- 字体颜色、背景色、字号
- 文本对齐（居左/居中/居右/平铺）

## 内容格式

编辑器内容以 **Lexical JSON** 格式存储（不是 HTML），存储在数据库 `text` 类型字段中：

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
- 后端可通过 `HTMLExport` 序列化为 HTML（如果需要）

## 下一步

- [内置插件](/rich-text/plugins) — 20 个插件详细功能说明
- [自定义插件](/rich-text/custom-plugin) — 开发自己的插件
