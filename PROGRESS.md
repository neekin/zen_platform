# Zen Platform 开发进度

> 最后更新：2026-07-03
> 版本：v0.2.0

---

## 项目概述

Zen Platform 是一个基于 Rails + React 的全栈开发平台，提供：
- **Content Engine**: 基于 Lexical 的富文本编辑器系统
- **Model DSL**: 声明式模型定义，自动生成 CRUD 界面
- **增强脚手架**: 一条命令生成完整产品形态（CRUD、看板、日历）
- **Admin 组件库**: 可复用的表单和展示组件

---

## 已完成的功能

### 一、核心系统

#### 1. API 认证系统 ✅
- JWT 认证（登录 + Token 验证）
- API Key 认证
- Bearer Token 认证
- HMAC 签名认证
- 统一响应格式 `{ code, message, data }`

#### 2. Swagger/OpenAPI 文档 ✅
- 集成 rswag 自动生成文档
- SwaggerDocControllable 模块控制 API 可见性
- Swagger UI 访问：`/api-docs`

#### 3. Admin 侧边栏配置 ✅
- 独立配置文件：`app/frontend/config/adminMenus.tsx`
- 脚手架生成时提示添加菜单

---

### 二、Content Engine 富文本编辑器

#### 模块结构
```
app/frontend/modules/content/
├── index.ts                    # 模块入口
├── types/index.ts              # 核心类型定义
├── toolbar/
│   ├── ToolbarPlugin.ts        # 工具栏配置解析
│   └── ToolbarRegistry.ts      # 工具栏注册表（插件自注册）
├── editor/
│   ├── RichTextEditor.tsx      # 编辑器主组件
│   ├── toolbar/Toolbar.tsx     # 工具栏组件
│   └── plugins/                # 16 个插件
├── renderer/
│   └── RichTextViewer.tsx      # 只读查看器
├── upload/
│   ├── UploadAdapter.ts        # 上传接口
│   └── ActiveStorageUploader.ts # Active Storage 实现
├── serializer/
│   ├── lexical.ts              # Lexical JSON 序列化
│   └── html.ts                 # HTML 序列化（纯文本提取）
└── styles/
    └── editor.css              # 编辑器样式
```

#### 已实现的 16 个插件

| 插件 | 功能 | 快捷键 |
|------|------|--------|
| **Bold** | 加粗 | Ctrl+B |
| **Italic** | 斜体 | Ctrl+I |
| **Underline** | 下划线 | Ctrl+U |
| **Strikethrough** | 删除线 | Ctrl+Shift+S |
| **Code** | 行内代码 | Ctrl+E |
| **Heading** | 标题 H1/H2/H3 | - |
| **Quote** | 引用 | - |
| **List** | 有序/无序列表 | - |
| **Link** | 链接（对话框输入） | Ctrl+K |
| **Image** | 图片（上传/拖拽/缩放） | - |
| **Table** | 表格（8x8 选择器） | - |
| **Code Block** | 代码块（20+ 语言） | - |
| **Slash Commands** | 斜杠命令（键盘导航） | / |
| **Mermaid** | 图表（流程图/序列图） | - |
| **Math** | 数学公式（KaTeX） | - |
| **Video** | 视频（YouTube/Bilibili） | - |
| **Attachment** | 附件上传 | - |
| **Mention** | @提及 | @ |
| **Emoji** | 表情符号 | : |

#### 使用方式
```tsx
import { RichTextEditor, RichTextViewer, ActiveStorageUploader } from '@/modules/content'

const uploader = new ActiveStorageUploader({
  accept: ['image/jpeg', 'image/png'],
  maxSize: 10 * 1024 * 1024,
})

// 编辑器
<RichTextEditor
  value={json}
  onChange={setJson}
  toolbar={['bold', 'italic', 'heading', 'image']}
  uploader={uploader}
/>

// 查看器
<RichTextViewer content={json} />
```

---

### 三、Model DSL 系统

#### 语法定义
```ruby
class Article < ApplicationRecord
  include Zen::ModelDsl

  # 字段定义
  field :title, :string, required: true, placeholder: "请输入标题"
  field :body, :rich_text, required: true
  field :status, :enum, values: %w[draft published archived], default: "draft"
  field :is_featured, :boolean, default: false

  # 关联定义
  belongs_to :category
  has_many :comments

  # 展示配置
  display do
    list do
      column :title, link: true
      column :status, badge: true
      column :created_at, format: :relative_time
    end

    form do
      section "基本信息" do
        field :title, required: true
        field :status, as: :radio
      end
      section "内容" do
        field :body, as: :rich_text
      end
    end

    detail do
      section "基本信息" do
        field :title, as: :heading
        field :status, as: :badge
      end
      section "内容" do
        field :body, as: :rich_text_viewer
      end
    end
  end
end
```

#### 支持的字段类型

| 类型 | 表单组件 | 列表展示 |
|------|----------|----------|
| `:string` | Input | 文本 |
| `:text` | TextArea | 截断 |
| `:rich_text` | RichTextEditor | 纯文本摘要 |
| `:integer/decimal` | InputNumber | 数字 |
| `:boolean` | Switch | 标签 |
| `:date/datetime` | DatePicker | 日期/相对时间 |
| `:enum` | Select | Badge |
| `:image` | ImageUpload | 缩略图 |
| `:file` | FileUpload | 文件列表 |
| `:tags` | TagInput | Tag 列表 |

#### 关联支持

| 关联类型 | 表单组件 | 列表展示 |
|----------|----------|----------|
| `belongs_to` | Select（远程搜索） | 显示关联名称 |
| `has_many` | 子表格 | 计数 |
| `has_many through` | 多选 | Tag 列表 |

---

### 四、增强脚手架生成器

#### 命令语法
```bash
# 基础用法
rails generate zen:admin Article title:string body:text --modal

# 富文本字段
rails generate zen:admin Article title:string body:text --rich-text=body --modal

# 枚举字段
rails generate zen:admin Product name:string status:string \
  --enums='{"status":["draft","active","archived"]}' --modal

# 关联
rails generate zen:admin Article title:string category_id:integer \
  --belongs-to=category --has-many=comments --modal

# 看板视图
rails generate zen:admin Task title:string status:string \
  --enums='{"status":["todo","doing","done"]}' --product=kanban --modal
```

#### 支持的选项

| 选项 | 说明 | 示例 |
|------|------|------|
| `--modal` | 浮层表单模式 | 默认模式 |
| `--page` | 独立页面模式 | 生成 Show/New/Edit |
| `--rich-text` | 富文本字段 | `--rich-text=body,content` |
| `--enums` | 枚举字段（JSON） | `--enums='{"status":["draft","active"]}'` |
| `--image` | 图片上传字段 | `--image=cover,avatar` |
| `--file` | 文件上传字段 | `--file=attachments` |
| `--tags` | 标签字段 | `--tags=tags` |
| `--belongs-to` | belongs_to 关联 | `--belongs-to=category,user` |
| `--has-many` | has_many 关联 | `--has-many=comments,tags` |
| `--product` | 产品形态 | `--product=kanban` |

#### 自动生成内容

| 文件 | 说明 |
|------|------|
| `app/controllers/admin/xxx_controller.rb` | Controller（含关联数据加载） |
| `app/frontend/pages/admin/xxx/Index.tsx` | 列表页（或 Kanban.tsx） |
| `app/frontend/pages/admin/xxx/Show.tsx` | 详情页（--page 模式） |
| `app/frontend/pages/admin/xxx/New.tsx` | 新增页（--page 模式） |
| `app/frontend/pages/admin/xxx/Edit.tsx` | 编辑页（--page 模式） |

---

### 五、Admin 组件库

```
app/frontend/modules/admin/components/
├── index.ts                    # 组件入口
├── form/                       # 表单组件
│   ├── ImageUpload.tsx         # 图片上传（预览、拖拽、删除）
│   ├── FileUpload.tsx          # 文件上传（多文件、进度、列表）
│   └── TagInput.tsx            # 标签输入（建议、远程搜索）
├── display/                    # 展示组件
│   ├── StatusBadge.tsx         # 状态标签（颜色映射）
│   └── RelativeTime.tsx        # 相对时间（3分钟前）
└── products/                   # 产品形态组件
    └── KanbanBoard.tsx         # 看板（拖拽排序、分组）
```

---

### 六、Ant Design 兼容性修复

| 问题 | 修复 |
|------|------|
| `destroyOnClose` 废弃 | 改用 `destroyOnHidden` |
| 静态 `message` API | 改用 `App.useApp()` |
| 静态 `notification` API | 改用 `App.useApp()` |
| `Card bordered` 废弃 | 改用 `variant="borderless"` |
| `Space direction` 废弃 | 改用 `orientation` |
| 硬编码颜色 | 改用 CSS 变量 |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| **后端** | Ruby on Rails 8.1, SQLite3 |
| **前端** | React 19, TypeScript 6, Vite 8 |
| **UI 框架** | Ant Design 6, ProComponents 3 |
| **富文本** | Lexical 0.46 |
| **图表** | Mermaid 11 |
| **公式** | KaTeX 0.16 |
| **API 文档** | rswag (Swagger/OpenAPI) |
| **文件上传** | Active Storage |

---

## 待完成的任务

### 产品形态
- [ ] 日历视图（Calendar）
- [ ] 仪表盘视图（Dashboard）

### AI 功能
- [ ] AI Assistant Plugin（需要后端 AI 端点）

---

## 继续开发指南

1. 克隆项目后运行：
   ```bash
   bundle install
   npm install
   bin/rails db:create db:migrate
   bin/rails db:seed  # 创建测试用户
   ```

2. 启动开发服务器：
   ```bash
   bin/dev
   ```

3. 访问：
   - 后台：`http://localhost:3000/admin`
   - 登录：`admin@example.com` / `password123`
   - API 文档：`http://localhost:3000/api-docs`

4. 测试脚手架生成：
   ```bash
   # 生成文章管理（带富文本）
   bin/rails generate zen:admin Article title:string body:text status:string \
     --rich-text=body --enums='{"status":["draft","published","archived"]}' \
     --modal
   
   # 生成任务看板
   bin/rails generate zen:admin Task title:string status:string \
     --enums='{"status":["todo","doing","done"]}' --product=kanban --modal
   ```

---

## 版本历史

### v0.2.0 (2026-07-03)
- 完善 Content Engine 16 个插件
- 实现 Model DSL 系统
- 增强脚手架生成器（关联、枚举、看板）
- 添加 Admin 组件库
- 修复所有 Ant Design 废弃警告

### v0.1.0 (2026-07-02)
- 初始版本
- API 认证系统
- Swagger 文档
- 基础 CRUD 脚手架
- 富文本编辑器原型
