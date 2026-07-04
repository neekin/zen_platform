# Zen Platform 再次验证报告

> 验证时间：2026-07-05 04:30 · 验证维度：7 项 · 发现问题：20 个

## 验证摘要

| 维度 | 状态 | 说明 |
|------|------|------|
| 后端测试 | ✅ 通过 | RSpec 142 examples, 0 failures |
| TypeScript | ✅ 通过 | `npx tsc --noEmit` 0 errors |
| Brakeman 安全 | ✅ 通过 | 0 warnings |
| RuboCop | ⚠️ 39 offenses | 27 可自动修复 |
| 前端测试 | ❌ 3 失败 | 82 tests 中 79 通过、3 失败 |
| Git 工作目录 | ❌ 混乱 | 未提交改动 + untracked 业务代码 |
| CI 实际状态 | ❌ 应为红 | 前端测试失败但记忆称"全绿" |

## 问题清单（按优先级）

### P0 严重（3 个）— 阻塞开源发布

1. **前端测试 3 个失败**
   - `test/components/display/StatusBadge.test.tsx` — 组件与测试不同步（期望"草稿"文案）
   - `test/pages/admin/ArticlesIndex.test.tsx` — 渲染超时 5000ms，mock 路径问题
   - 第 3 个失败待确认（columnRenderer 系列之一）

2. **routes.rb 重复路由定义**
   - `articles` 定义两次（line 26 + line 28-32），后者覆盖前者的 `only` 限制
   - `users` 定义两次且冲突（line 27 `only: [:index,:show,...]` vs line 39 `except: [:show]`）

3. **Git 工作目录混乱 + 业务代码残留**
   - Article/Comment 在 `dc6dced` 被删除后又重新出现（部分 untracked）
   - untracked：`articles_controller.rb`、`article_policy.rb`、`articles/Show.tsx`、`design/`
   - modified 未提交：`permission.rb`、`routes.rb`、`package-lock.json`
   - 与"不想框架包含业务代码"的定位冲突

### P1 重要（7 个）

4. **版本号不一致** — MEMORY.md 写 v0.3.0，VERSION/CHANGELOG 写 1.0.0
5. **端口不一致** — CONTRIBUTING.md 写 `localhost:3000`，.env.example ALLOWED_ORIGINS 缺 3100
6. **CSP style_src :unsafe_inline**（生产环境也有）— CHANGELOG 称已移除但代码未做
7. **测试目录混乱 + dead code**
   - `test/controllers/api/v1/*_test.rb` + `test_helper.rb` 是 minitest 残留（项目用 RSpec）
   - `columnRenderer` 有 4 个测试文件（`.test.ts`/`.test.tsx`/`2.test.tsx`/`3.test.ts`）
   - `app/frontend/pages/admin/tests/` 空目录残留
8. **.gitignore `*.md` 规则** — 忽略根目录所有开发文档（PHASE1_*.md、QUALITY_GUIDE_V3.md 等）
9. **README.md vs README_CN.md 对比表不一致** — 英文版对比 Administrate，中文版对比若依
10. **CI 用 `npx tsc --noEmit` 而非 `npm run check`** — 两者用不同 tsconfig

### P2 改进（6 个）

11. RuboCop 39 offenses（27 可自动修复）
12. SECURITY.md 用 `security@example.com` 占位符
13. PaymentController 是业务代码且只有空 TODO 实现
14. Comment 模型缺 policy（若保留示例）
15. 文档数量 CHANGELOG 说 19 篇但实际 35 篇
16. ApiController 无强制认证 before_action（authenticate_with 靠手动调用）

### P3 锦上添花（4 个）

17. 缺 GitHub Issue/PR 模板（`.github/ISSUE_TEMPLATE/`）
18. 缺 Dependabot 配置
19. 缺代码覆盖率报告
20. LICENSE 缺年份/作者

## 修复建议优先级

1. **立即**：修 routes.rb 重复定义 → 修/删失败测试 → 清理 git 工作目录（决定保留或删除业务代码）
2. **本周**：统一端口/版本号 → 修 CSP → 清理测试 dead code → 修 .gitignore
3. **后续**：RuboCop 自动修复 → 补 Issue 模板/Dependabot → 清理 PaymentController
