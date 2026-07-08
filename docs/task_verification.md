# 任务完成验证机制

## 验证流程

### 任务完成前必须检查
1. **代码变更验证** — `git diff` 确认实际修改了目标文件
2. **测试运行** — `bundle exec rspec` 确认测试通过
3. **功能验证** — 手动测试核心流程
4. **回归检查** — 确认没有破坏现有功能

### 任务状态检查清单
- [ ] 相关文件确实被修改
- [ ] 测试文件确实被创建/更新
- [ ] 测试全部通过
- [ ] 核心功能正常工作
- [ ] 没有引入新的 bug

### 禁止行为
- ❌ 标记 done 但没有实际代码变更
- ❌ 只修改了部分代码就提交
- ❌ 没有运行测试就提交
- ❌ 没有验证功能是否正常

## 验证命令

### 检查代码变更
```bash
git log --oneline -5  # 最近5次提交
git diff HEAD~3 --stat  # 最近3次提交修改了哪些文件
```

### 运行测试
```bash
bundle exec rspec spec/lib/workflow/
bundle exec rspec spec/models/workflow_*
```

### 检查特定功能
```bash
# 检查 user_task 是否移除
grep -rn "user_task" lib/workflow/

# 检查测试覆盖
grep -c "it " spec/lib/workflow/engine_spec.rb
```
