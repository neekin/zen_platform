---
title: 大屏数据可视化
---

# 大屏数据可视化

Zen Platform 内置大屏页面，适合投屏展示、会议室演示等场景。

## 访问方式

1. Dashboard 页面点击"大屏模式"按钮
2. 直接访问 `/admin/bigscreen`

## 功能特点

- **全屏深色主题** — 适合投屏展示
- **实时趋势图** — ActionCable WebSocket 推送数据
- **统计卡片** — 用户总数、今日新增等
- **最近活动** — 实时审计日志
- **全屏切换** — 一键进入/退出全屏
- **实时时钟** — 顶部显示当前时间

## 自定义大屏

### 1. 修改统计数据

编辑 `app/controllers/admin/bigscreen_controller.rb` 的 `build_stats` 方法：

```ruby
def build_stats
  [
    { label: "用户总数", value: User.count, icon: "user", color: "#D4A537" },
    { label: "今日新增", value: User.where("created_at > ?", Date.today).count, icon: "rise", color: "#52c41a" },
    { label: "本周新增", value: User.where("created_at > ?", 1.week.ago).count, icon: "active", color: "#1677FF" },
    # 添加更多统计...
  ]
end
```

### 2. 修改图表数据

编辑 `initial_chart_data` 方法：

```ruby
def initial_chart_data
  # 返回最近 10 个数据点
  10.downto(0).map do |i|
    time = i.minutes.ago
    {
      time: time.strftime("%H:%M"),
      value: YourModel.where(created_at: (i + 1).minutes.ago..i.minutes.ago).count,
    }
  end
end
```

### 3. 修改前端布局

编辑 `app/frontend/pages/admin/bigscreen/Index.tsx`：

- 添加更多 `RealtimeTrendChart` 组件
- 调整 `Row`/`Col` 布局
- 修改颜色主题

### 4. 添加更多实时图表

```tsx
<Row gutter={[16, 16]}>
  <Col xs={24} lg={12}>
    <RealtimeTrendChart
      initialData={chart_data}
      title="用户增长趋势"
      yFieldLabel="用户数"
      color="#D4A537"
    />
  </Col>
  <Col xs={24} lg={12}>
    <RealtimeTrendChart
      initialData={chart_data}
      title="访问量趋势"
      yFieldLabel="访问数"
      color="#1677FF"
    />
  </Col>
</Row>
```

## 与其他页面的区别

| 特性 | Dashboard | 大屏 |
|------|-----------|------|
| 侧边栏 | ✅ 有 | ❌ 无 |
| 导航 | ✅ 完整导航 | ❌ 仅返回按钮 |
| 主题 | 跟随用户设置 | 固定深色 |
| 用途 | 日常管理 | 投屏展示 |
| 全屏 | ❌ | ✅ 支持 |

## 布局说明

大屏页面不使用 `AdminLayout`，直接渲染页面内容：

```tsx
// 绕过 AdminLayout，不显示侧边栏
BigScreen.layout = (page: ReactNode) => page
```
