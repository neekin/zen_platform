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
│       ├── link/
│       └── image/              # 图片插件（支持上传/拖拽/缩放）
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

---

## 待完成的任务

### 高优先级
- [ ] 修复 Active Storage CSRF token 问题（图片上传 500 错误）
- [ ] 完善 Image Plugin 的上传流程（当前使用 base64 临时方案）
- [ ] 添加 Link Plugin 对话框（输入 URL）

### 中优先级
- [ ] Table Plugin 实现
- [ ] Code Block Plugin 实现
- [ ] Markdown 快捷输入支持
- [ ] Slash Commands（斜杠命令）

### 低优先级
- [ ] AI Assistant Plugin
- [ ] Mermaid 图表 Plugin
- [ ] Math 公式 Plugin
- [ ] Video Plugin
- [ ] Attachment Plugin
- [ ] Mention @提及
- [ ] Emoji Plugin

---

## 已知问题

1. **Active Storage CSRF 问题**
   - 症状：图片上传返回 500 错误
   - 原因：CSRF token 验证失败
   - 状态：已修复 meta 标签获取方式，待验证

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
