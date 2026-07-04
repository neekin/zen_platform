---
title: 内置插件
---

# 内置插件详解

## 文本格式插件

| 插件 | 功能 | 快捷键 |
|------|------|--------|
| Bold | 加粗 | Ctrl+B |
| Italic | 斜体 | Ctrl+I |
| Underline | 下划线 | Ctrl+U |
| Strikethrough | 删除线 | Ctrl+Shift+S |
| Code | 行内代码 | Ctrl+E |

## 块级元素插件

| 插件 | 功能 |
|------|------|
| Heading | 标题 H1/H2/H3 |
| Quote | 引用块 |
| List | 有序/无序列表 |
| Code Block | 代码块（21 种语言语法高亮） |
| Table | 表格（8x8 可视选择器） |

## 富内容插件

### Image（图片）

- 拖拽图片到编辑器上传
- 粘贴图片上传
- 支持缩放、对齐、标题编辑
- 存储使用 Active Storage

### Link（链接）

- Ctrl+K 快捷插入
- URL 自动验证
- 支持编辑和取消链接

### Video（视频）

- 支持 YouTube、Bilibili、Vimeo
- 粘贴 URL 自动转为 16:9 嵌入

### Attachment（附件）

- 文件上传，支持拖拽
- 文件图标颜色按类型区分

### Mention（提及）

- 输入 `@` 触发用户搜索
- 键盘导航选择

### Emoji（表情）

- 输入 `:` 触发表情选择器
- 8 个分类，128 个表情

## 图表与公式插件

### Mermaid（图表）

在编辑器中插入 Mermaid 代码块，自动渲染：

```
graph TD
  A[开始] --> B{判断}
  B -->|是| C[执行]
  B -->|否| D[结束]
```

支持：流程图、序列图、甘特图、类图等。

### Math（数学公式）

使用 KaTeX 渲染数学公式：

- 行内公式：`$E = mc^2$`
- 块级公式：`$$\int_a^b f(x)dx$$`

输入 LaTeX 代码，实时预览渲染结果。

## 其他插件

| 插件 | 功能 |
|------|------|
| History | 撤销 (Ctrl+Z) / 重做 (Ctrl+Y) |
| Slash Commands | 输入 `/` 触发命令菜单，9 种命令 |
