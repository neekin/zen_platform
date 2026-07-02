# Zen Platform 开发进度

> 最后更新：2026-07-02

## 已完成的功能

### 1. API 认证系统 ✅
- JWT 认证（登录 + Token 验证）
- API Key 认证
- Bearer Token 认证
- HMAC 签名认证
- 统一响应格式 `{ code, message, data }`

### 2. Swagger/OpenAPI 文档 ✅
- 集成 rswag 自动生成文档
- SwaggerDocControllable 模块控制 API 可见性
- Swagger UI 访问：`/api-docs`

### 3. 自定义脚手架生成器 ✅

#### Admin 脚手架
```bash
# 浮层表单模式（默认）
rails generate zen:admin Article title:string body:text --modal

# 独立页面模式
rails generate zen:admin Article title:string body:text --page

# 交互式询问
rails generate zen:admin Article title:string body:text
```

生成文件：
- `app/controllers/admin/articles_controller.rb`
- `app/frontend/pages/admin/articles/Index.tsx`
- 自动添加路由到 admin 命名空间

#### API 脚手架
```bash
rails generate zen:api Article title:string body:text
```

生成文件：
- `app/controllers/api/v1/articles_controller.rb`
- `spec/requests/api/v1/articles_spec.rb`（rswag 测试）

### 4. Content Engine 富文本编辑器 ✅

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
│   └── plugins/                # 插件目录
│       ├── bold/
│       ├── italic/
│       ├── underline/
│       ├── strikethrough/
│       ├── code/
│       ├── history/
│       ├── heading/
│       ├── quote/
│       ├── list/
│       ├── link/               # 链接插件（支持对话框输入）
│       ├── image/              # 图片插件（支持上传/拖拽/缩放）
│       ├── table/              # 表格插件（支持行列选择）
│       ├── code-block/         # 代码块插件（支持语言选择）
│       ├── slash-commands/     # 斜杠命令（支持键盘导航）
│       ├── mermaid/            # Mermaid 图表（流程图、序列图等）
│       ├── math/               # 数学公式（KaTeX 渲染）
│       ├── video/              # 视频嵌入（YouTube、Bilibili 等）
│       ├── attachment/         # 附件上传（拖拽、下载）
│       ├── mention/            # @提及（用户搜索）
│       └── emoji/              # 表情符号（分类、搜索）
├── renderer/
│   └── RichTextViewer.tsx      # 只读查看器
├── upload/
│   ├── UploadAdapter.ts        # 上传接口
│   └── ActiveStorageUploader.ts # Active Storage 实现
├── serializer/
│   ├── lexical.ts              # Lexical JSON 序列化
│   └── html.ts                 # HTML 序列化
└── styles/
    └── editor.css              # 编辑器样式
```

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

### 5. Admin 侧边栏配置 ✅
- 独立配置文件：`app/frontend/config/adminMenus.tsx`
- 脚手架生成时提示添加菜单

### 6. Article 示例集成 ✅
- 使用 Content Engine 富文本编辑器
- 支持图片上传
- Modal 浮层表单编辑

### 7. Toolbar 重构 (插件自注册) ✅
- 创建 ToolbarRegistry 注册表
- 插件自注册工具栏项，无需修改核心文件
- ToolbarItemId 改为 string 类型，支持扩展
- 所有内置插件已迁移到自注册模式

### 8. Table Plugin ✅
- 使用 @lexical/table 官方包
- 支持 8x8 尺格选择器
- 支持行列插入

### 9. Code Block Plugin ✅
- 使用 @lexical/code 官方包
- 支持 20+ 编程语言选择
- 搜索过滤功能

### 10. Slash Commands ✅
- 输入 / 触发命令菜单
- 支持键盘导航（上下箭头、回车、Esc）
- 支持搜索过滤
- 包含标题、列表、引用、代码块、表格等命令

### 11. Mermaid Chart Plugin ✅
- 使用 mermaid 库渲染图表
- 支持实时预览和编辑
- 支持多种图表类型（流程图、序列图、甘特图等）

### 12. Math Formula Plugin ✅
- 使用 KaTeX 渲染数学公式
- 支持行内和块级公式
- 实时预览功能

### 13. Video Plugin ✅
- 支持 YouTube, Bilibili, Vimeo 等平台
- 响应式 iframe 嵌入
- URL 自动检测和转换

### 14. Attachment Plugin ✅
- 支持文件上传和拖拽
- 文件图标和大小显示
- 下载链接功能

### 15. Mention @提及 Plugin ✅
- 输入 @ 触发用户搜索
- 支持键盘导航
- 可配置用户搜索函数

### 16. Emoji Plugin ✅
- 内置表情分类和搜索
- 支持 : 触发
- 8 个表情分类（常用、手势、人物、动物等）

### 17. Model DSL 系统 ✅
- 声明式定义模型字段、关联、展示方式
- 支持 field、display、product 配置
- 自动推断字段组件类型
- 语法: `field :title, :string, required: true`

### 18. 增强脚手架生成器 ✅
- 支持 `--rich-text` 富文本字段
- 支持 `--enums` 枚举字段
- 支持 `--image` 图片上传字段
- 支持 `--file` 文件上传字段
- 支持 `--tags` 标签字段
- 自动生成对应组件

### 19. Admin 组件库 ✅
- ImageUpload: 图片上传组件（预览、拖拽、裁剪）
- FileUpload: 文件上传组件（多文件、进度、列表）
- TagInput: 标签输入组件（建议、远程搜索）
- StatusBadge: 状态标签组件（颜色映射）
- RelativeTime: 相对时间组件（3分钟前）

---

## 待完成的任务

### 高优先级
- [x] 修复 Active Storage CSRF token 问题（图片上传 500 错误）✅ 2026-07-02
- [x] 完善 Image Plugin 的上传流程（当前使用 base64 临时方案）✅ 2026-07-02
- [x] 添加 Link Plugin 对话框（输入 URL）✅ 2026-07-02

### 中优先级
- [x] Table Plugin 实现 ✅ 2026-07-02
- [x] Code Block Plugin 实现 ✅ 2026-07-02
- [x] Markdown 快捷输入支持 ✅ 2026-07-02
- [x] Slash Commands（斜杠命令）✅ 2026-07-02
- [x] Model DSL 系统 ✅ 2026-07-02
- [x] 增强脚手架生成器 ✅ 2026-07-02
- [x] Admin 组件库 ✅ 2026-07-02

### 低优先级
- [ ] AI Assistant Plugin（需要后端 AI 端点）
- [x] Mermaid 图表 Plugin ✅ 2026-07-02
- [x] Math 公式 Plugin ✅ 2026-07-02
- [x] Video Plugin ✅ 2026-07-02
- [x] Attachment Plugin ✅ 2026-07-02
- [x] Mention @提及 ✅ 2026-07-02
- [x] Emoji Plugin ✅ 2026-07-02

---

## 已知问题

1. **Active Storage CSRF 问题**
   - 症状：图片上传返回 500 错误
   - 原因：CSRF token 验证失败
   - 状态：✅ 已修复 cookie 解析 bug（split('=') 截断 base64 token）

2. **Divider 废弃警告**
   - 症状：Ant Design 6 控制台警告
   - 状态：已修复，改用自定义 CSS

---

## 技术栈

- **后端**: Ruby on Rails 8.1, SQLite3
- **前端**: React 19, TypeScript, Ant Design 6, Vite
- **富文本**: Lexical
- **API 文档**: rswag (Swagger/OpenAPI)
- **文件上传**: Active Storage

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

4. 测试富文本编辑器：
   - 访问 `/admin/articles`
   - 新建文章 → 使用富文本编辑器
