---
title: 内置插件
---

# 内置插件详解

Zen Platform 编辑器内置 20 个插件。本文档说明每个插件的功能和使用方式。

## 文本格式插件

### Bold（加粗）

**快捷键：** Ctrl+B  
**Toolbar ID：** `bold`

```tsx
<RichTextEditor toolbar={['bold']} />
```

选中文字后点击工具栏按钮或按 Ctrl+B 加粗。

### Italic（斜体）

**快捷键：** Ctrl+I  
**Toolbar ID：** `italic`

```tsx
<RichTextEditor toolbar={['italic']} />
```

### Underline（下划线）

**快捷键：** Ctrl+U  
**Toolbar ID：** `underline`

```tsx
<RichTextEditor toolbar={['underline']} />
```

### Strikethrough（删除线）

**快捷键：** Ctrl+Shift+S  
**Toolbar ID：** `strikethrough`

```tsx
<RichTextEditor toolbar={['strikethrough']} />
```

### Code（行内代码）

**快捷键：** Ctrl+E  
**Toolbar ID：** `code`

```tsx
<RichTextEditor toolbar={['code']} />
```

选中文字后按 Ctrl+E，文字会变成 `行内代码` 样式。

## 块级元素插件

### Heading（标题）

**Toolbar ID：** `heading`

```tsx
<RichTextEditor toolbar={['heading']} />
```

点击工具栏的标题按钮，选择 H1/H2/H3 级别。

### Quote（引用）

**Toolbar ID：** `quote`

```tsx
<RichTextEditor toolbar={['quote']} />
```

点击后当前段落变为引用块样式。

### List（列表）

**Toolbar ID：** `bullet-list`, `numbered-list`

```tsx
<RichTextEditor toolbar={['bullet-list', 'numbered-list']} />
```

- `bullet-list` — 无序列表（圆点）
- `numbered-list` — 有序列表（数字）

### Code Block（代码块）

**Toolbar ID：** `code-block`

```tsx
<RichTextEditor toolbar={['code-block']} />
```

点击后插入代码块，支持 21 种语言的语法高亮：
JavaScript, TypeScript, Python, Ruby, Go, Rust, Java, C, C++, C#, PHP, Swift, Kotlin, SQL, HTML, CSS, Shell, YAML, JSON, Markdown, XML

### Table（表格）

**Toolbar ID：** `table`

```tsx
<RichTextEditor toolbar={['table']} />
```

点击后弹出 8x8 网格选择器，鼠标悬停选择行列数，点击插入表格。插入后按 Tab 键在单元格间导航。

## 富内容插件

### Image（图片）

**Toolbar ID：** `image`

```tsx
import { ActiveStorageUploader } from '@/modules/content'

const uploader = new ActiveStorageUploader({
  accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: 10 * 1024 * 1024,
})

<RichTextEditor toolbar={['image']} uploader={uploader} />
```

**使用方式：**
- 点击工具栏图片按钮，选择文件上传
- 直接拖拽图片到编辑器
- 从剪贴板粘贴图片

**功能：**
- 拖拽四角缩放
- 左/中/右对齐
- 添加图片标题
- 最大宽度限制，响应式缩放

### Link（链接）

**快捷键：** Ctrl+K  
**Toolbar ID：** `link`

```tsx
<RichTextEditor toolbar={['link']} />
```

**使用方式：**
- 选中文字后按 Ctrl+K 或点击工具栏
- 弹出对话框输入 URL 和显示文本
- URL 自动验证（必须以 http/https 开头）

### Video（视频）

**Toolbar ID：** `video`

```tsx
<RichTextEditor toolbar={['video']} />
```

**使用方式：**
- 粘贴视频 URL 到编辑器，自动转为嵌入播放器
- 支持 YouTube、Bilibili、Vimeo

**支持的 URL 格式：**
- YouTube: `https://www.youtube.com/watch?v=xxx` 或 `https://youtu.be/xxx`
- Bilibili: `https://www.bilibili.com/video/BVxxx`
- Vimeo: `https://vimeo.com/xxx`

### Attachment（附件）

**Toolbar ID：** `attachment`

```tsx
import { ActiveStorageUploader } from '@/modules/content'

const fileUploader = new ActiveStorageUploader({
  accept: ['application/pdf', 'application/zip'],
  maxSize: 50 * 1024 * 1024,
})

<RichTextEditor toolbar={['attachment']} uploader={fileUploader} />
```

**使用方式：**
- 点击工具栏附件按钮上传
- 拖拽文件到编辑器

**功能：**
- 文件图标颜色按类型区分（PDF 红色、Word 蓝色、Excel 绿色）
- 显示文件名和大小
- 下载链接

### Mention（提及）

**Toolbar ID：** `mention`

```tsx
<RichTextEditor toolbar={['mention']} />
```

**使用方式：**
- 输入 `@` 触发用户搜索菜单
- 键盘上下键导航，Enter 选择
- 显示用户头像和名称

### Emoji（表情）

**Toolbar ID：** `emoji`

```tsx
<RichTextEditor toolbar={['emoji']} />
```

**使用方式：**
- 输入 `:` 触发表情选择器
- 8 个分类（表情、人物、自然、食物、旅行、活动、物品、符号）
- 搜索过滤

## 图表与公式插件

### Mermaid（图表）

**Toolbar ID：** `mermaid`

```tsx
<RichTextEditor toolbar={['mermaid']} />
```

**使用方式：**
- 点击工具栏 Mermaid 按钮
- 在弹出的代码编辑器中输入 Mermaid 语法
- 实时预览渲染结果

**支持的图表类型：**

```
# 流程图
graph TD
  A[开始] --> B{判断}
  B -->|是| C[执行]
  B -->|否| D[结束]

# 序列图
sequenceDiagram
  Alice->>Bob: Hello
  Bob-->>Alice: Hi!

# 甘特图
gantt
  title 项目计划
  section 开发
  设计: 2026-01-01, 7d
  编码: 2026-01-08, 14d

# 类图
classDiagram
  class User {
    +String name
    +login()
  }
```

### Math（数学公式）

**Toolbar ID：** `math`

```tsx
<RichTextEditor toolbar={['math']} />
```

**使用方式：**
- 点击工具栏 Math 按钮
- 输入 LaTeX 代码
- 实时预览渲染结果

**行内公式：** `$E = mc^2$`

**块级公式：**
```
$$\frac{d}{dx}\left( \int_{a}^{x} f(t) dt \right) = f(x)$$
```

## 其他插件

### History（历史）

**快捷键：** Ctrl+Z（撤销）/ Ctrl+Y（重做）

```tsx
<RichTextEditor toolbar={['bold', 'italic']} />
// History 自动启用，无需在 toolbar 中配置
```

### Slash Commands（斜杠命令）

```tsx
<RichTextEditor toolbar={['bold', 'italic', 'heading']} />
// Slash Commands 自动启用
```

**使用方式：**
- 输入 `/` 触发命令菜单
- 支持以下命令：
  - `/h1`, `/h2`, `/h3` — 标题
  - `/bullet` — 无序列表
  - `/quote` — 引用块
  - `/code` — 代码块
  - `/table` — 表格
  - `/hr` — 分割线

## 完整示例

```tsx
import { RichTextEditor, ActiveStorageUploader } from '@/modules/content'

const imageUploader = new ActiveStorageUploader({
  accept: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSize: 10 * 1024 * 1024,
})

function ArticleEditor() {
  const [content, setContent] = useState('{}')

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      toolbar={[
        'bold', 'italic', 'underline', 'heading',
        'quote', 'bullet-list', 'numbered-list',
        'link', 'image', 'table', 'code-block',
        'mermaid', 'math',
      ]}
      uploader={imageUploader}
      placeholder="开始写作..."
    />
  )
}
```
