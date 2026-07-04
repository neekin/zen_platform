---
title: 富文本编辑器
---

# 富文本编辑器

Zen Platform 内置基于 Lexical 的富文本编辑器，开箱即用 20 个插件。

## 快速使用

```ruby
# app/models/article.rb
field :body, :rich_text
```

前端自动渲染 `RichTextEditor` 组件。

## 架构

```
modules/content/
├── editor/
│   ├── RichTextEditor.tsx    # 编辑器主组件
│   ├── plugins/              # 20 个插件
│   └── toolbar/              # 工具栏
├── renderer/
│   └── RichTextViewer.tsx    # 只读查看器
├── upload/
│   ├── UploadAdapter.ts      # 上传接口
│   └── ActiveStorageUploader.ts  # Rails Active Storage 实现
└── serializer/
    ├── lexical.ts            # JSON 序列化
    └── html.ts               # HTML 序列化
```

## 使用方式

```tsx
import { RichTextEditor, RichTextViewer } from '@/modules/content'

// 编辑器
<RichTextEditor
  value={content}
  onChange={setContent}
  toolbar={['bold', 'italic', 'heading', 'link', 'image']}
/>

// 只读查看
<RichTextViewer content={content} />
```

## 内置插件

| 分类 | 插件 |
|------|------|
| 文本格式 | Bold, Italic, Underline, Strikethrough, Code |
| 块级元素 | Heading, Quote, List, Code Block, Table |
| 富内容 | Image, Link, Video, Attachment, Mention, Emoji |
| 图表公式 | Mermaid, KaTeX (Math) |
| 其他 | History, Slash Commands |

## 配置

```ruby
field :body, :rich_text,
  plugins: %w[bold italic underline heading list quote code link image mermaid katex]
```

不指定 `plugins` 时默认启用所有插件。

## 下一步

- [内置插件](/rich-text/plugins) — 20 个插件详解
- [自定义插件](/rich-text/custom-plugin) — 开发自己的插件
