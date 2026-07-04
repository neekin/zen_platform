---
title: 内置插件
---

# 内置插件详解

Zen Platform 编辑器内置 20 个插件，覆盖文本格式、块级元素、富内容、图表公式四大类。

## 文本格式插件

| 插件 | 功能 | 快捷键 | Toolbar ID |
|------|------|--------|------------|
| Bold | 加粗 | Ctrl+B | `bold` |
| Italic | 斜体 | Ctrl+I | `italic` |
| Underline | 下划线 | Ctrl+U | `underline` |
| Strikethrough | 删除线 | Ctrl+Shift+S | `strikethrough` |
| Code | 行内代码 | Ctrl+E | `code` |

这些插件使用 Lexical 的 `FORMAT_TEXT_COMMAND`，可直接通过 toolbar 配置控制显隐。

## 块级元素插件

| 插件 | 功能 | Toolbar ID |
|------|------|------------|
| Heading | 标题 H1/H2/H3 | `heading` |
| Quote | 引用块 | `quote` |
| List | 有序/无序列表 | `bullet-list`, `numbered-list` |
| Code Block | 代码块（21 种语言语法高亮） | `code-block` |
| Table | 表格（8x8 可视选择器） | `table` |

### Code Block 支持的语言

JavaScript, TypeScript, Python, Ruby, Go, Rust, Java, C, C++, C#, PHP, Swift, Kotlin, SQL, HTML, CSS, Shell, YAML, JSON, Markdown, XML。

### Table 插件

点击工具栏后弹出 8x8 网格选择器，鼠标悬停选择行列数。插入后支持 Tab 键在单元格间导航。

## 富内容插件

### Image（图片）

**功能：**
- 拖拽图片到编辑器上传
- 粘贴图片上传
- 点击工具栏按钮上传
- 支持缩放（拖拽四角）、对齐（左/中/右）、标题编辑
- 最大宽度限制，响应式缩放

**存储：** Active Storage Direct Upload

**Toolbar ID:** `image`

### Link（链接）

**功能：**
- Ctrl+K 快捷插入
- 弹出对话框输入 URL 和文本
- URL 自动验证（必须以 http/https 开头）
- 支持编辑已有链接和取消链接

**Toolbar ID:** `link`

### Video（视频）

**支持平台：**
- YouTube (`youtube.com/watch?v=`, `youtu.be/`)
- Bilibili (`bilibili.com/video/BV`)
- Vimeo (`vimeo.com/`)

**使用：** 粘贴视频 URL，自动转为 16:9 响应式 iframe 嵌入。

**Toolbar ID:** `video`

### Attachment（附件）

**功能：**
- 文件上传，支持拖拽
- 文件图标颜色按类型区分（PDF 红色、Word 蓝色、Excel 绿色等）
- 显示文件名和大小
- 下载链接

**Toolbar ID:** `attachment`

### Mention（提及）

**功能：**
- 输入 `@` 触发用户搜索菜单
- 键盘上下键导航，Enter 选择
- 显示用户头像和名称

**Toolbar ID:** `mention`

### Emoji（表情）

**功能：**
- 输入 `:` 触发表情选择器
- 8 个分类（表情、人物、自然、食物、旅行、活动、物品、符号）
- 128 个常用表情
- 搜索过滤

**Toolbar ID:** `emoji`

## 图表与公式插件

### Mermaid（图表）

在编辑器中插入 Mermaid 代码块，自动渲染为 SVG 图表。

**支持的图表类型：**
- 流程图 (`graph TD`)
- 序列图 (`sequenceDiagram`)
- 甘特图 (`gantt`)
- 类图 (`classDiagram`)
- 状态图 (`stateDiagram`)
- 饼图 (`pie`)

**Toolbar ID:** `mermaid`

### Math（数学公式）

使用 KaTeX 渲染数学公式。

**行内公式：** `$E = mc^2$`

**块级公式：**
```
$$\frac{d}{dx}\left( \int_{a}^{x} f(t) dt \right) = f(x)$$
```

输入 LaTeX 代码后实时预览渲染结果。

**Toolbar ID:** `math`

## 其他插件

| 插件 | 功能 | 快捷键 |
|------|------|--------|
| History | 撤销/重做 | Ctrl+Z / Ctrl+Y |
| Slash Commands | `/` 触发命令菜单 | `/` |

### Slash Commands

输入 `/` 触发命令菜单，支持以下命令：

- 标题 (H1/H2/H3)
- 无序列表
- 引用块
- 代码块
- 表格
- 分割线

支持键盘导航和搜索过滤。

## 插件架构

每个插件通过 `createPlugin()` 工厂创建，在模块导入时自动注册到 `ToolbarRegistry`：

```typescript
import { createPlugin } from '../factory'

export const boldPlugin = createPlugin({
  id: 'bold',
  name: 'Bold',
  toolbarItems: [{ id: 'bold', icon: BoldIcon, label: '加粗', group: 'format' }],
  commands: { 'bold': (ctx) => ctx.getEditor().dispatchCommand(FORMAT_TEXT_COMMAND, 'bold') },
  shortcuts: { 'ctrl+b': 'bold' },
})
```

**DecoratorNode 模式：** Mermaid、KaTeX、Video、Attachment、Mention 使用 Lexical 的 `DecoratorNode`，在编辑器内渲染 React 组件。
