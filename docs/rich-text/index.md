---
title: 富文本编辑器
---

# 富文本编辑器

Zen Platform 内置基于 Lexical 的富文本编辑器，开箱即用 20 个插件。编辑器深度集成 Rails Active Storage，支持图片/文件上传、Mermaid 图表、KaTeX 数学公式等高级功能。

## 快速使用

### Model DSL 声明

```ruby
# app/models/article.rb
class Article < ApplicationRecord
  include Zen::ModelDsl

  field :body, :rich_text
  field :notes, :text  # 普通文本字段
end
```

DSL 声明 `:rich_text` 后，脚手架生成器会自动：
- 导入 `RichTextEditor` 和 `RichTextViewer` 组件
- 表单中渲染富文本编辑器
- 列表/详情中渲染只读查看器

### 手动使用

```tsx
import { RichTextEditor, RichTextViewer, ActiveStorageUploader } from '@/modules/content'

// 创建上传器
const uploader = new ActiveStorageUploader({
  accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: 10 * 1024 * 1024, // 10MB
})

// 编辑器
<RichTextEditor
  value={content}
  onChange={setContent}
  toolbar={['bold', 'italic', 'heading', 'link', 'image']}
  uploader={uploader}
  placeholder="请输入内容..."
/>

// 只读查看
<RichTextViewer content={content} />
```

## 架构

```
modules/content/
├── editor/
│   ├── RichTextEditor.tsx      # 编辑器主组件 (320行)
│   ├── plugins/                # 20 个插件
│   │   ├── bold/index.ts       # 加粗
│   │   ├── image/              # 图片上传 (DecoratorNode)
│   │   ├── mermaid/            # Mermaid 图表 (DecoratorNode)
│   │   ├── math/               # KaTeX 公式 (DecoratorNode)
│   │   └── ...
│   └── toolbar/
│       ├── Toolbar.tsx         # 工具栏 UI
│       └── ToolbarRegistry.ts  # 插件自注册中心
├── renderer/
│   └── RichTextViewer.tsx      # 只读查看器
├── upload/
│   ├── UploadAdapter.ts        # 上传接口定义
│   └── ActiveStorageUploader.ts # Rails Active Storage 实现
└── serializer/
    ├── lexical.ts              # Lexical JSON 序列化
    └── html.ts                 # HTML 序列化
```

## 内容格式

编辑器内容以 **Lexical JSON** 格式存储（非 HTML），存储在数据库 `text` 类型字段中：

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

**优势：**
- 保留完整编辑器状态（格式、节点类型、嵌套结构）
- 支持 DecoratorNode（Mermaid/KaTeX/Video 等富内容）
- 前端用 `RichTextViewer` 渲染，后端可序列化为 HTML

## 工具栏配置

### 预设工具栏

```tsx
// 默认工具栏（推荐）
toolbar={['bold', 'italic', 'underline', 'heading', 'quote', 'bullet-list', 'numbered-list', 'link', 'image']}

// 精简工具栏
toolbar={['bold', 'italic', 'heading', 'link']}

// 完整工具栏
toolbar={['bold', 'italic', 'underline', 'strikethrough', 'code', 'heading', 'quote', 'bullet-list', 'numbered-list', 'link', 'image', 'table', 'code-block', 'mermaid', 'math']}
```

### 自定义工具栏

```tsx
import { RichTextEditor } from '@/modules/content'
import type { ToolbarConfig } from '@/modules/content'

const customToolbar: ToolbarConfig = [
  { id: 'bold', icon: BoldIcon, label: '加粗', group: 'format' },
  { id: 'italic', icon: ItalicIcon, label: '斜体', group: 'format' },
  // ...
]

<RichTextEditor toolbar={customToolbar} />
```

## 上传系统

### Active Storage 集成

编辑器内置 `ActiveStorageUploader`，自动对接 Rails Active Storage：

```tsx
import { ActiveStorageUploader } from '@/modules/content'

const imageUploader = new ActiveStorageUploader({
  accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: 10 * 1024 * 1024,
})

const fileUploader = new ActiveStorageUploader({
  accept: ['application/pdf', 'application/zip'],
  maxSize: 50 * 1024 * 1024,
})
```

### 上传流程

1. 用户拖拽/粘贴图片或点击上传按钮
2. `ActiveStorageUploader` 调用 `/rails/active_storage/direct_uploads` 创建预签名 URL
3. 文件直接上传到存储服务（S3/本地）
4. 返回 `UploadResult`（id, url, filename, size）
5. 编辑器插入图片/文件节点

## 常见用法

### 表单中使用

```tsx
// DslForm 自动处理 rich_text 字段
<DslForm
  meta={meta}
  initialValues={article}
  onFinish={handleSubmit}
/>
```

### 独立编辑器

```tsx
const [content, setContent] = useState('{}')

<RichTextEditor
  value={content}
  onChange={setContent}
  toolbar={['bold', 'italic', 'heading', 'link', 'image', 'mermaid']}
  uploader={imageUploader}
  placeholder="开始写作..."
/>
```

### 只读展示

```tsx
<RichTextViewer content={article.body} />
```

## 下一步

- [内置插件](/rich-text/plugins) — 20 个插件详解
- [自定义插件](/rich-text/custom-plugin) — 开发自己的插件
