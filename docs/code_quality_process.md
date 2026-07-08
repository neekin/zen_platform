# Zen Platform 代码质量检查流程

## 目标
防止低级错误（语法错误、接口不匹配、缺少测试覆盖）再次发生。

---

## 修改前检查清单

### 1. 明确改动范围
- [ ] 这个改动会影响哪些组件？（控制器、模型、前端、测试）
- [ ] 有没有其他地方使用了相同的代码？（grep 搜索调用方）
- [ ] 改动是否涉及接口契约？（后端返回格式 vs 前端期望格式）

### 2. 查询 MCP（antd/Inertia 相关）
- [ ] **使用 antd 组件前** → 查询 MCP 确认当前 API 是否已废弃
- [ ] **使用新 API 前** → 查询 MCP 确认参数和用法
- [ ] **迁移旧代码前** → 查询 MCP 确认新旧 API 对应关系

### 3. 先写测试
- [ ] 修改核心库前，先写测试验证当前行为
- [ ] 修改控制器前，先写请求测试验证返回格式
- [ ] 修改前端前，先写组件测试验证 props 接口

---

## 修改中检查清单

### 1. 代码规范
- [ ] Ruby 语法正确（常量定义在类级别，不在方法内）
- [ ] TypeScript 类型匹配（前端 props 与后端返回一致）
- [ ] 没有硬编码字符串（使用 i18n 或常量）

### 2. 接口契约
- [ ] 后端返回格式与前端期望一致
- [ ] 分页结构统一：`{ pagination: { page, per_page, total } }`
- [ ] 错误响应格式统一：`{ errors: { field: ["message"] } }`

### 3. N+1 查询检查（重要！）
- [ ] **每个查询都检查是否需要 includes** — 遍历结果时访问关联必须预加载
- [ ] **控制器 index/show/action 中的 map 循环** — 检查循环内是否访问了关联
- [ ] **使用 Bullet gem 检测** — 开发环境下 Bullet 会自动警告 N+1 问题
- [ ] **常见 N+1 场景**：
  - `User.all.map { |u| u.roles }` → 需要 `.includes(:roles)`
  - `WorkflowInstance.all.map { |i| i.workflow_tasks }` → 需要 `.includes(:workflow_tasks)`
  - `WorkflowTask.all.map { |t| t.assignee }` → 需要 `.includes(:assignee)`
  - `WorkflowHistory.all.map { |h| h.operator }` → 需要 `.includes(:operator)`
- [ ] **过度预加载也是问题** — 如果 includes 的关联没有被使用，会触发 AVOID 警告

---

## 修改后检查清单

### 1. 运行测试
```bash
# 单元测试
bundle exec rspec spec/lib/
bundle exec rspec spec/resources/

# 集成测试
bundle exec rspec spec/requests/

# 前端测试
npm test
```

### 2. 手动验证
- [ ] 启动开发服务器：`bin/dev`
- [ ] 访问修改的页面
- [ ] 检查浏览器控制台无错误
- [ ] 检查 Rails 日志无警告

### 3. 代码审查
- [ ] `git diff` 检查改动范围
- [ ] 确认没有意外修改
- [ ] 确认测试覆盖充分

---

## 提交前强制检查

### 必须通过的测试
```bash
bundle exec rspec spec/lib/zen/
bundle exec rspec spec/resources/
```

### 必须运行的命令
```bash
# 语法检查
ruby -c lib/zen/resource/result.rb

# 类型检查（如有）
npx tsc --noEmit
```

---

## 常见错误案例

### 1. 语法错误：方法内定义常量
```ruby
# ❌ 错误
def to_inertia
  PAGINATION_KEYS = %i[page per_page]  # SyntaxError
end

# ✅ 正确
class Result
  PAGINATION_KEYS = %i[page per_page].freeze  # 类级别
end
```

### 2. 接口不匹配
```ruby
# 后端返回
{ page: 1, per_page: 20, total: 100 }

# 前端期望
{ pagination: { page: 1, per_page: 20, total: 100 } }
```

### 3. 遗漏调用方
```ruby
# 只检查了 users_controller
# 但 workflow_definitions_controller 也使用 to_inertia
```

### 4. antd API 废弃
```typescript
// ❌ 旧 API（antd 5）
<Divider type="vertical" />
<Drawer width={400} />

// ✅ 新 API（antd 6）
<Divider orientation="vertical" />
<Drawer size="large" />
```

**预防措施：** 使用组件前查询 MCP 确认 API 状态

### 5. N+1 查询
```ruby
# ❌ 错误：循环内访问关联，触发 N+1
WorkflowInstance.all.map do |inst|
  inst.workflow_tasks.count  # 每个实例额外查询一次
end

# ✅ 正确：预加载关联
WorkflowInstance.includes(:workflow_tasks).all.map do |inst|
  inst.workflow_tasks.count  # 已预加载，无额外查询
end
```

**预防措施：**
- 控制器中每个 `map`/`each` 循环都检查是否访问了关联
- 使用 Bullet gem 自动检测（开发环境）
- 提交前检查 Rails 日志有无 N+1 警告

---

## 自动化检查（可选）

### pre-commit hook
```bash
#!/bin/bash
# .git/hooks/pre-commit

# 运行相关测试
bundle exec rspec spec/lib/zen/
if [ $? -ne 0 ]; then
  echo "❌ 测试失败，请修复后再提交"
  exit 1
fi
```

### CI 集成
```yaml
# .github/workflows/test.yml
- name: Run tests
  run: |
    bundle exec rspec spec/lib/zen/
    bundle exec rspec spec/resources/
```
# Test
