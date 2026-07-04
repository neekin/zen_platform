# 富文本概述

Zen Platform 内置基于 Lexical 的富文本编辑器，提供 20 个插件。

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

## 使用

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

## 下一步

- [内置插件](/rich-text/plugins) — 20 个插件列表
- [自定义插件](/rich-text/custom-plugin) — 开发自己的插件
