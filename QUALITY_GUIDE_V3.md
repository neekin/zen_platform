# Quality Guide V3 — 第三轮全维度审查修复指南

> **审查日期**: 2026-07-04
> **审查维度**: 安全 / 代码质量 / 前端架构 / API 设计 / DevOps / 文档 / DX / 可维护性（固定 8 维 checklist）
> **问题总数**: 26 个（P0: 1 / P1: 7 / P2: 17 / P3: 1）
> **执行人**: mimo

---

## 执行须知

1. **每个 Task 完成后立即运行测试**：`bundle exec rspec && npx vitest run && npx tsc --noEmit`
2. **不要批量修改后一次性测试** — 逐个 Task 验证
3. **Phase 顺序执行** — P0 安全问题最优先
4. **完成后删除本文件**

---

## Phase 1 — 安全加固（P0 + P1 安全项）

### Task 1: constantize RCE 白名单防护 [P0]

**文件**: `app/controllers/admin/audit_logs_controller.rb`

**问题**: 第 81 行 `version.item_type.constantize` 无白名单验证，攻击者通过篡改 PaperTrail 记录可执行任意 Ruby 类方法。

**修复方案**:

```ruby
# 在类顶部添加白名单
ALLOWED_RESTORE_TYPES = %w[Article Comment User Role ApiKey Export Notification].freeze

# 修改 restore 方法
def restore
  version = PaperTrail::Version.find(params[:id])
  item_type = version.item_type

  unless ALLOWED_RESTORE_TYPES.include?(item_type)
    redirect_to admin_audit_logs_path, alert: "不支持恢复此类型: #{item_type}"
    return
  end

  # 原有逻辑...
  if version.reify
    version.reify.save!
    redirect_to admin_audit_logs_path, notice: "已恢复到历史版本"
  else
    redirect_to admin_audit_logs_path, alert: "恢复失败"
  end
end
```

**验证**: `bundle exec rspec spec/requests/admin/audit_logs_spec.rb`

---

### Task 2: send_file 路径遍历防护 [P1]

**文件**: `app/controllers/admin/exports_controller.rb`

**问题**: 第 40 行 `send_file` 直接使用用户可控路径，可能遍历到项目根目录之外的文件。

**修复方案**:

```ruby
def download
  export = Export.find(params[:id])
  file_path = export.file_path

  # 验证文件路径在 storage 目录内
  storage_root = Rails.root.join("storage").to_s
  resolved_path = File.expand_path(file_path)

  unless resolved_path.start_with?(storage_root + "/")
    redirect_to admin_exports_path, alert: "非法文件路径"
    return
  end

  unless File.exist?(resolved_path)
    redirect_to admin_exports_path, alert: "文件不存在"
    return
  end

  send_file resolved_path, disposition: :attachment
end
```

**验证**: `bundle exec rspec spec/requests/admin/exports_spec.rb`

---

### Task 3: CSP 生产环境移除 unsafe_inline [P1]

**文件**: `config/initializers/content_security_policy.rb`

**问题**: 生产环境 CSP 中 `script_src :unsafe_inline` 允许任意内联脚本执行，存在 XSS 风险。

**修复方案**:

```ruby
# config/initializers/content_security_policy.rb
Rails.application.config.content_security_policy do |policy|
  policy.default_src :self, :https
  policy.font_src    :self, :https, :data
  policy.img_src     :self, :https, :data
  policy.object_src  :none
  policy.style_src   :self, :https, :unsafe_inline  # Tailwind/Vite 需要
  # 使用 nonce 替代 unsafe_inline
  if Rails.env.production?
    policy.script_src :self, :https, :nonce
  else
    policy.script_src :self, :https, :unsafe_inline
  end
  policy.connect_src :self, :https, "http://localhost:3036", Rails.env.production? ? nil : "ws://localhost:3036"
  policy.frame_ancestors :none
end

# 生成 nonce
Rails.application.config.content_security_policy_nonce_generator = ->(request) {
  SecureRandom.base64(16)
}
Rails.application.config.content_security_policy_nonce_directives = %w[script-src]
```

**验证**: 启动 `bin/dev`，检查生产模式 CSP 头不含 `unsafe-inline`（script-src）

---

### Task 4: JWT 独立 secret [P1]

**文件**: `app/models/concerns/jwt_authenticatable.rb`

**问题**: JWT 使用 `Rails.application.secret_key_base` 签名，与 Session Cookie 共享密钥。一旦 JWT 泄露，攻击者可伪造 Session。

**修复方案**:

1. 生成独立 secret：
```bash
ruby -rsecurerandom -e 'puts SecureRandom.hex(32)'
```

2. 添加到 `config/credentials.yml.enc`：
```bash
EDITOR=vim bin/rails credentials:edit
# 添加：
# jwt_secret: <上面生成的 hex>
```

3. 修改 `jwt_authenticatable.rb`：
```ruby
def jwt_secret
  Rails.application.credentials.jwt_secret || Rails.application.secret_key_base
end

# 将所有 Rails.application.secret_key_base 引用替换为 jwt_secret
```

4. 在 `.env.example` 中添加：
```
# JWT_SECRET=<hex string> (生产环境通过 credentials 配置)
```

**验证**: `bundle exec rspec spec/requests/api/v1/auth_spec.rb`

---

### Task 5: meta_controller 加认证 [P1]

**文件**: `app/controllers/api/v1/meta_controller.rb`

**问题**: `/api/v1/meta` 端点无认证，任何人可查询模型字段结构，暴露内部架构。

**修复方案**:

```ruby
class Api::V1::MetaController < Api::V1::BaseController
  before_action :authenticate_with_jwt_or_api_key!

  def index
    # 原有逻辑...
  end

  private

  def authenticate_with_jwt_or_api_key!
    # 尝试 JWT 认证
    token = request.headers["Authorization"]&.sub(/^Bearer\s/, "")
    if token && JwtAuthenticatable.valid_token?(token)
      @current_user = JwtAuthenticatable.user_from_token(token)
      return if @current_user
    end

    # 尝试 API Key 认证
    api_key = request.headers["X-API-Key"]
    if api_key
      key = ApiKey.find_by(key: api_key, active: true)
      if key && !key.expired?
        @current_user = key.user
        return
      end
    end

    render json: { error: "Unauthorized" }, status: :unauthorized
  end
end
```

**验证**: `bundle exec rspec spec/requests/api/v1/meta_spec.rb`，确认无认证返回 401

---

## Phase 2 — 代码质量 + 前端架构

### Task 6: RuboCop 自动修复 [P1]

**命令**:
```bash
bundle exec rubocop -A
```

**注意**: 自动修复后手动审查 diff，确认无逻辑变更。对于 `Metrics/AbcSize` 等 Metrics 类 cop，可能需要手动重构。

**验证**: `bundle exec rubocop` 应从 174 offenses 降至 < 50

---

### Task 7: React Error Boundary [P1]

**文件**: 新建 `app/frontend/components/ErrorBoundary.tsx`

**问题**: 前端渲染错误直接白屏，无错误恢复机制。

**创建 ErrorBoundary 组件**:

```tsx
import { Component, type ReactNode, type ErrorInfo } from 'react'
import { Result, Button } from 'antd'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <Result
          status="error"
          title="页面渲染错误"
          subTitle={this.state.error?.message || '发生了未知错误'}
          extra={[
            <Button key="retry" type="primary" onClick={this.handleReset}>
              重试
            </Button>,
            <Button key="home" onClick={() => window.location.href = '/admin'}>
              返回首页
            </Button>,
          ]}
        />
      )
    }
    return this.props.children
  }
}
```

**修改 `app/frontend/entrypoints/inertia.tsx`**:

在 Inertia 应用外层包裹 ErrorBoundary：

```tsx
import ErrorBoundary from '../components/ErrorBoundary'

// 在 createInertiaApp 外层包裹
// 找到渲染入口，用 ErrorBoundary 包裹
<ErrorBoundary>
  {/* Inertia app */}
</ErrorBoundary>
```

**验证**: 在某个页面组件中故意 `throw new Error('test')`，确认显示错误页面而非白屏

---

### Task 8: API 用户列表分页 [P1]

**文件**: `app/controllers/api/v1/users_controller.rb`

**问题**: `User.all` 直接返回全部用户，数据量大时内存溢出且响应缓慢。

**修复方案**:

```ruby
def index
  page = (params[:page] || 1).to_i
  per_page = (params[:per_page] || 20).to_i.clamp(1, 100)

  users = User.offset((page - 1) * per_page).limit(per_page)
  total = User.count

  render json: {
    data: users.map { |u| serialize_user(u) },
    meta: {
      page: page,
      per_page: per_page,
      total: total,
      total_pages: (total.to_f / per_page).ceil,
    },
  }
end
```

**验证**: `bundle exec rspec spec/requests/api/v1/users_spec.rb`，添加分页参数测试

---

### Task 9: CI 添加 ESLint job [P2]

**文件**: `.github/workflows/ci.yml`

**问题**: CI 只有 RuboCop，没有 ESLint，前端代码风格无强制检查。

**修复方案**:

在 ci.yml 的 jobs 中添加：

```yaml
  frontend-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: 'npm'
      - run: npm ci --legacy-peer-deps
      - run: npx tsc --noEmit
      - run: npm run lint
```

**验证**: CI YAML 语法检查 `yamllint .github/workflows/ci.yml`

---

### Task 10: 清理 eslint-plugin-react 残留 [P2]

**文件**: `package.json`, `eslint.config.js`

**问题**: `eslint-plugin-react` 在 package.json dependencies 中残留，但 ESLint 10 不兼容（已在 eslint.config.js 中移除引用）。

**修复方案**:

```bash
npm uninstall eslint-plugin-react --legacy-peer-deps
```

确认 `eslint.config.js` 中无 `eslint-plugin-react` 引用。

**验证**: `npm run lint` 仍正常运行，无 import 错误

---

### Task 11: 合并重复认证模块 [P2]

**文件**: `app/models/concerns/bearer_token_authenticatable.rb`, `app/models/concerns/jwt_authenticatable.rb`

**问题**: 两个模块代码大量重复（token 解析、用户查找逻辑），应合并为统一认证模块。

**修复方案**:

将 `bearer_token_authenticatable.rb` 的逻辑合并到 `jwt_authenticatable.rb`：

```ruby
module JwtAuthenticatable
  extend ActiveSupport::Concern

  # 从 Authorization header 提取 token
  def self.extract_token(request)
    header = request.headers["Authorization"]
    return nil unless header&.start_with?("Bearer ")
    header.sub(/^Bearer\s/, "")
  end

  # 验证 token 并返回用户
  def self.authenticate(request)
    token = extract_token(request)
    return nil unless token
    user_from_token(token)
  end

  def self.user_from_token(token)
    begin
      payload = JWT.decode(token, jwt_secret, true, algorithm: "HS256")[0]
      User.find_by(id: payload["user_id"])
    rescue JWT::ExpiredSignature, JWT::VerificationError, JWT::DecodeError
      nil
    end
  end

  def self.jwt_secret
    Rails.application.credentials.jwt_secret || Rails.application.secret_key_base
  end
end
```

删除 `bearer_token_authenticatable.rb`，更新引用处改为 `JwtAuthenticatable`。

**验证**: `bundle exec rspec spec/requests/api/v1/`

---

### Task 12: 合并重复 ALLOWED_EXPORT_RESOURCES [P2]

**文件**: `app/controllers/admin/exports_controller.rb`, `app/jobs/export_job.rb`

**问题**: 两个文件各自定义了 `ALLOWED_EXPORT_RESOURCES`，应统一到一处。

**修复方案**:

在 `app/models/export.rb` 中定义：

```ruby
class Export < ApplicationRecord
  ALLOWED_RESOURCES = %w[Article Comment User Role ApiKey].freeze
  # ...
end
```

在 `exports_controller.rb` 和 `export_job.rb` 中引用 `Export::ALLOWED_RESOURCES`。

同时修复 `exports_controller.rb` 中 `ALLOWED_EXPORT_RESOURCES = [].freeze` 导致导出功能不可用的问题（Task #23）。

**验证**: `bundle exec rspec spec/requests/admin/exports_spec.rb`

---

### Task 13: Inertia.js 进度条 [P2]

**文件**: `app/frontend/entrypoints/inertia.tsx`

**问题**: 页面切换时无加载进度条，用户感知不到加载状态。

**修复方案**:

```tsx
import { createInertiaApp } from '@inertiajs/react'
// 在 setup 回调中添加进度条配置
createInertiaApp({
  // ...
  setup({ el, App, props }) {
    // 添加进度条
    const progress = {
      delay: 250,
      color: '#1677FF',
      includeCSS: true,
      showSpinner: true,
    }
    createRoot(el).render(
      <ErrorBoundary>
        <App {...props} />
      </ErrorBoundary>
    )
  },
})
```

或者如果使用 `@inertiajs/react` v3 的方式：

```tsx
import { router } from '@inertiajs/react'

// 在文件顶部
router.on('start', () => {
  NProgress.start()
})
router.on('finish', () => {
  NProgress.done()
})
```

**验证**: 手动点击导航，确认顶部出现蓝色进度条

---

### Task 14: tsconfig 移除 content/editor/plugins 排除 [P2]

**文件**: `tsconfig.app.json`

**问题**: 排除了 `content/editor/plugins` 目录，隐藏类型错误。

**修复方案**:

删除 `exclude` 中的 `"app/frontend/modules/content/editor/plugins"` 条目。

```bash
npx tsc --noEmit
```

如果出现类型错误，逐一修复，不要重新排除。

**验证**: `npx tsc --noEmit` 0 errors，且不再排除任何源码目录

---

## Phase 3 — API 规范 + DevOps

### Task 15: CI brakeman 级别调整 [P2]

**文件**: `.github/workflows/ci.yml`

**问题**: brakeman `-w3` 只报 High 级别，漏报 Medium/Weak 安全问题。

**修复方案**:

```yaml
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.4.2'
          bundler-cache: true
      - run: bundle exec brakeman -w2 --no-pager  # 改为 -w2
```

**验证**: CI YAML 语法检查

---

### Task 16: API 强参数验证 [P2]

**文件**: 所有 `app/controllers/api/v1/*.rb` 控制器

**问题**: API 控制器无 `params.require().permit()` 验证，可接受任意参数。

**修复方案**:

为每个 API 控制器添加强参数：

```ruby
# app/controllers/api/v1/articles_controller.rb
private

def article_params
  params.require(:article).permit(:title, :body, :status, :published_at, tag_ids: [])
end

# app/controllers/api/v1/users_controller.rb
private

def user_params
  params.require(:user).permit(:name, :email, :role_ids: [])
end
```

对每个 API 控制器重复此模式。

**验证**: `bundle exec rspec spec/requests/api/v1/`，添加参数过滤测试

---

### Task 17: docker-compose 端口一致性 [P2]

**文件**: `docker-compose.yml`, `Dockerfile`

**问题**: Dockerfile `EXPOSE 80`，docker-compose 映射 `3000:3000`，不一致。

**修复方案**:

统一使用 3000 端口：

```dockerfile
# Dockerfile
EXPOSE 3000
```

```yaml
# docker-compose.yml
services:
  web:
    build: .
    ports:
      - "3000:3000"
```

**验证**: `docker compose config` 确认端口一致

---

### Task 18: API 统一错误响应格式 [P2]

**文件**: 新建 `docs/api/error-format.md`

**问题**: API 错误响应格式不统一，客户端难以处理。

**创建文档**:

```markdown
# API 错误响应格式

## 统一格式

所有 API 错误响应遵循以下格式：

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "人类可读的错误描述",
    "details": {
      "field": "具体字段错误信息"
    }
  }
}
```

## 错误码

| HTTP Status | code | 含义 |
|-------------|------|------|
| 400 | bad_request | 请求参数错误 |
| 401 | unauthorized | 未认证 |
| 403 | forbidden | 无权限 |
| 404 | not_found | 资源不存在 |
| 422 | validation_error | 验证失败 |
| 429 | rate_limited | 请求频率超限 |
| 500 | internal_error | 服务器内部错误 |

## 示例

### 验证错误 (422)
```json
{
  "error": {
    "code": "validation_error",
    "message": "验证失败",
    "details": {
      "email": "已被使用",
      "name": "不能为空"
    }
  }
}
```

### 未认证 (401)
```json
{
  "error": {
    "code": "unauthorized",
    "message": "请提供有效的认证信息"
  }
}
```
```

然后在 `app/controllers/api/v1/base_controller.rb` 中实现统一错误渲染：

```ruby
def render_error(code:, message:, details: nil, status:)
  render json: {
    error: {
      code: code,
      message: message,
      details: details,
    },
  }, status: status
end
```

**验证**: `bundle exec rspec spec/requests/api/v1/`

---

## Phase 4 — 文档 + DX

### Task 19: 测试编写指南 [P2]

**文件**: 修改 `CONTRIBUTING.md`

**添加内容**:

```markdown
## 如何编写测试

### 后端测试 (RSpec)

#### 模型测试
```ruby
# spec/models/article_spec.rb
RSpec.describe Article, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:title) }
  end

  describe 'associations' do
    it { should have_many(:comments).dependent(:destroy) }
  end
end
```

#### 请求测试
```ruby
# spec/requests/admin/articles_spec.rb
RSpec.describe 'Admin::Articles', type: :request do
  before { sign_in create(:user, :admin) }

  describe 'GET /admin/articles' do
    it 'returns success' do
      get admin_articles_path
      expect(response).to have_http_status(:ok)
    end
  end
end
```

#### Swagger API 测试
```ruby
# spec/requests/api/v1/articles_spec.rb
path '/api/v1/articles' do
  get '获取文章列表' do
    tags 'Articles'
    security [jwt_auth: []]
    parameter name: :page, in: :query, type: :integer

    response '200', '成功' do
      schema type: :object, properties: {
        data: { type: :array, items: { type: :object } }
      }
      run_test!
    end
  end
end
```

### 前端测试 (Vitest)

#### 组件测试
```tsx
// test/components/StatusBadge.test.tsx
import { render, screen } from '@testing-library/react'
import StatusBadge from '@/modules/admin/components/display/StatusBadge'

describe('StatusBadge', () => {
  it('renders correct label', () => {
    render(<StatusBadge value="active" />)
    expect(screen.getByText('启用')).toBeInTheDocument()
  })
})
```

#### 页面测试
```tsx
// test/pages/admin/ArticlesIndex.test.tsx
import { render } from '@testing-library/react'
import ArticlesIndex from '@/pages/admin/articles/Index'

// Mock inertia router 和 AdminLayout
vi.mock('@inertiajs/react', () => ({
  router: { visit: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(), reload: vi.fn() },
}))

describe('ArticlesIndex', () => {
  it('renders table', () => {
    const { container } = render(<ArticlesIndex meta={mockMeta} articles={[]} />)
    expect(container).toBeTruthy()
  })
})
```

### 运行测试

```bash
# 后端
bundle exec rspec                    # 全部
bundle exec rspec spec/models/       # 仅模型
bundle exec rspec spec/requests/     # 仅请求

# 前端
npx vitest run                       # 全部
npx vitest run test/components/      # 仅组件

# Swagger 文档更新
bundle exec rspec spec/requests/ --format Rswag::Specs::SwaggerFormatter --order defined
```
```

**验证**: 确认 CONTRIBUTING.md 包含完整的测试编写指南

---

### Task 20: API 限流策略文档 [P2]

**文件**: 新建 `docs/api/rate-limiting.md`

```markdown
# API 限流策略

## 限流规则

Zen Platform API 使用 rack-attack 进行请求限流。

### 认证端点
| 端点 | 限制 | 窗口 |
|------|------|------|
| POST /api/v1/auth/login | 5 次 | 60 秒 |
| POST /api/v1/auth/register | 3 次 | 60 秒 |

### 普通 API 端点
| 认证方式 | 限制 | 窗口 |
|----------|------|------|
| JWT | 300 次 | 60 秒 |
| API Key | 1000 次 | 60 秒 |

### 超限响应

HTTP Status: 429

```json
{
  "error": {
    "code": "rate_limited",
    "message": "请求频率超限，请稍后重试",
    "details": {
      "retry_after": 30
    }
  }
}
```

### 响应头

| Header | 说明 |
|--------|------|
| X-RateLimit-Limit | 窗口内最大请求数 |
| X-RateLimit-Remaining | 剩余请求数 |
| X-RateLimit-Reset | 重置时间 (Unix timestamp) |

## 自定义限流

在 `config/initializers/rack_attack.rb` 中配置：

```ruby
Rack::Attack.throttle("api/ip", limit: 300, period: 60) do |req|
  req.ip if req.path.start_with?("/api/")
end
```
```

**验证**: 文档存在且内容完整

---

### Task 21: 环境变量参考文档 [P2]

**文件**: 新建 `docs/guide/environment-variables.md`

```markdown
# 环境变量参考

## 数据库

| 变量 | 默认值 | 说明 |
|------|--------|------|
| DATABASE_URL | sqlite3:db/development.sqlite3 | 数据库连接字符串 |

## 认证

| 变量 | 默认值 | 说明 |
|------|--------|------|
| JWT_SECRET | (从 credentials 读取) | JWT 签名密钥 |
| SECRET_KEY_BASE | (Rails 生成) | Session Cookie 签名密钥 |

## API

| 变量 | 默认值 | 说明 |
|------|--------|------|
| API_RATE_LIMIT | 300 | API 每分钟请求限制 |
| API_RATE_LIMIT_WINDOW | 60 | 限流窗口（秒） |

## 前端

| 变量 | 默认值 | 说明 |
|------|--------|------|
| VITE_API_BASE_URL | /api/v1 | API 基础路径 |

## 文件存储

| 变量 | 默认值 | 说明 |
|------|--------|------|
| STORAGE_PATH | storage | 文件存储根目录 |

## 部署

| 变量 | 默认值 | 说明 |
|------|--------|------|
| RAILS_ENV | development | Rails 环境 |
| RAILS_MAX_THREADS | 5 | 最大线程数 |
| WEB_CONCURRENCY | 2 | Web 进程数 |
| PORT | 3000 | 服务端口 |
```

**验证**: 文档存在且包含所有环境变量

---

### Task 22: 修复导出功能 ALLOWED_EXPORT_RESOURCES [P2]

**文件**: `app/controllers/admin/exports_controller.rb`

**问题**: `ALLOWED_EXPORT_RESOURCES = [].freeze` 导致导出功能完全不可用。

**修复方案**:

与 Task 12 配合，在 `Export` 模型中定义允许导出的资源：

```ruby
class Export < ApplicationRecord
  ALLOWED_RESOURCES = %w[Article Comment User Role ApiKey Notification].freeze
  # ...
end
```

在 `exports_controller.rb` 中引用 `Export::ALLOWED_RESOURCES`，并删除 `ALLOWED_EXPORT_RESOURCES = [].freeze`。

在 `app/views/admin/exports/` 的前端表单中提供资源选择下拉框。

**验证**: 在管理后台尝试导出 Article，确认生成成功

---

### Task 23: application_controller 添加 current_user [P2]

**文件**: `app/controllers/application_controller.rb`

**问题**: 无统一的 `current_user` 方法定义，认证逻辑分散在各控制器中。

**修复方案**:

```ruby
class ApplicationController < ActionController::Base
  # Session 认证（Admin 后台）
  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end
  helper_method :current_user

  def user_signed_in?
    current_user.present?
  end
  helper_method :user_signed_in?

  def authenticate_user!
    redirect_to admin_login_path, alert: "请先登录" unless user_signed_in?
  end

  def require_admin
    authenticate_user!
    redirect_to admin_root_path, alert: "无权限" unless current_user&.admin?
  end
end
```

更新 Admin 控制器中使用 `authenticate_user!` / `require_admin` 替代各自定义的认证方法。

**验证**: `bundle exec rspec`，全部测试通过

---

### Task 24: ESLint warnings 逐步修复 [P2]

**文件**: `app/frontend/**/*.tsx`, `app/frontend/**/*.ts`

**问题**: 142 个 ESLint warnings（主要是 `@typescript-eslint/no-explicit-any`）。

**修复方案**:

1. 统计各类 warning：
```bash
npx eslint app/frontend --max-warnings 9999 2>&1 | grep "warning" | awk '{print $NF}' | sort | uniq -c | sort -rn
```

2. 优先修复高频 warning：
   - `@typescript-eslint/no-explicit-any`: 替换为具体类型或 `unknown`
   - `@typescript-eslint/no-unused-vars`: 删除未使用的变量
   - `prefer-const`: 添加 `const`

3. 每次修复后运行 `npx eslint app/frontend` 确认 warning 数量减少

**目标**: warning 数量从 142 降至 < 50

**验证**: `npx eslint app/frontend --max-warnings 50`

---

### Task 25: 清理 console.log [P3]

**文件**: `app/frontend/entrypoints/admin.ts`

**问题**: 残留 `console.log` 调试代码。

**修复方案**:

删除所有 `console.log` 语句，或替换为条件日志：

```tsx
if (import.meta.env.DEV) {
  console.log(...)
}
```

**验证**: `grep -r "console.log" app/frontend/` 无结果（或仅 DEV 条件下）

---

### Task 26: 前端测试覆盖率提升 [P2]

**文件**: `test/` 目录

**问题**: 前端测试仅 40 tests / 9 files，关键组件未覆盖。

**需要添加测试的组件**:

1. `test/components/DslTable.test.tsx` — DSL 表格组件
2. `test/components/DslForm.test.tsx` — DSL 表单组件
3. `test/components/DslModal.test.tsx` — DSL 弹窗组件
4. `test/components/StatusBadge.test.tsx` — 状态标签
5. `test/components/RelativeTime.test.tsx` — 相对时间
6. `test/components/TagInput.test.tsx` — 标签输入
7. `test/components/FileUpload.test.tsx` — 文件上传
8. `test/components/ErrorBoundary.test.tsx` — 错误边界（Task 7 创建的）
9. `test/pages/admin/UsersIndex.test.tsx` — 用户管理页面
10. `test/pages/admin/RolesIndex.test.tsx` — 角色管理页面

每个测试文件至少覆盖：
- 正常渲染
- 关键交互（点击、输入）
- 错误状态

**验证**: `npx vitest run`，测试数量从 40 增至 80+

---

## 执行顺序总结

```
Phase 1 (安全): Task 1 → 2 → 3 → 4 → 5
Phase 2 (质量+前端): Task 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14
Phase 3 (API+DevOps): Task 15 → 16 → 17 → 18
Phase 4 (文档+DX): Task 19 → 20 → 21 → 22 → 23 → 24 → 25 → 26
```

## 完成验证清单

- [ ] `bundle exec rspec` — 140+ examples, 0 failures
- [ ] `npx vitest run` — 80+ tests, 0 failures
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npx eslint app/frontend` — 0 errors, < 50 warnings
- [ ] `bundle exec rubocop` — < 50 offenses
- [ ] `bundle exec brakeman -w2` — 0 High warnings
- [ ] CI 全部 jobs 通过
- [ ] 删除本文件
