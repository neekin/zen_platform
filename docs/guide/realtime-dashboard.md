---
title: 实时仪表盘
---

# 实时仪表盘

Zen Platform 内置实时趋势图组件，基于 ActionCable WebSocket + @ant-design/charts，支持后端实时推送数据。

## 快速使用

### 1. 启动实时推送

```ruby
# Rails console
DashboardStatsJob.perform_later
```

### 2. 查看效果

访问 `/admin/dashboard`，图表会每 30 秒自动更新。

## 组件说明

### RealtimeTrendChart

**路径：** `app/frontend/components/admin/RealtimeTrendChart.tsx`

```tsx
<RealtimeTrendChart
  initialData={chart_data}  // 初始数据（从后端 Inertia props 获取）
  title="实时数据趋势"        // 图表标题
  yFieldLabel="请求数"        // Y 轴标签
  color="#D4A537"             // 图表颜色
/>
```

### DashboardChannel

**路径：** `app/channels/dashboard_channel.rb`

```ruby
class DashboardChannel < ApplicationCable::Channel
  def subscribed
    stream_from "dashboard_trend"
  end
end
```

### DashboardStatsJob

**路径：** `app/jobs/dashboard_stats_job.rb`

定时执行统计并推送到前端：

```ruby
class DashboardStatsJob < ApplicationJob
  def perform
    data = stats
    ActionCable.server.broadcast("dashboard_trend", data)
    self.class.set(wait: 30.seconds).perform_later  # 每 30 秒执行一次
  end

  private

  def stats
    {
      time: Time.current.strftime("%H:%M:%S"),
      value: calculate_value,
    }
  end

  # 修改此方法自定义统计逻辑
  def calculate_value
    rand(20..80)  # 示例：随机值
    # User.count                    # 用户总数
    # User.where("created_at > ?", 1.hour.ago).count  # 最近 1 小时新增
  end
end
```

## 自定义统计逻辑

编辑 `app/jobs/dashboard_stats_job.rb` 的 `calculate_value` 方法：

```ruby
# 示例 1：统计最近 1 分钟的请求数
def calculate_value
  RequestLog.where("created_at > ?", 1.minute.ago).count
end

# 示例 2：统计在线用户数
def calculate_value
  User.where("last_seen_at > ?", 5.minutes.ago).count
end

# 示例 3：统计今日新增记录数
def calculate_value
  [
    User.where("created_at > ?", Date.today).count,
    Article.where("created_at > ?", Date.today).count,
    Comment.where("created_at > ?", Date.today).count,
  ].sum
end

# 示例 4：多条线（分类数据）
def stats
  {
    time: Time.current.strftime("%H:%M:%S"),
    categories: [
      { name: "用户", value: User.count },
      { name: "文章", value: Article.count },
    ]
  }
end
```

## 推送间隔

修改 `DashboardStatsJob` 中的 `set(wait: 30.seconds)`：

```ruby
# 每 10 秒
self.class.set(wait: 10.seconds).perform_later

# 每 1 分钟
self.class.set(wait: 1.minute).perform_later

# 每 5 分钟
self.class.set(wait: 5.minutes).perform_later
```

## 数据格式

后端推送格式（JSON）：

```json
{
  "time": "12:00:00",
  "value": 42
}
```

前端 `received` 回调接收此数据并添加到图表。

## 架构

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  DashboardStats │────▶│  ActionCable     │────▶│  RealtimeTrend  │
│  Job            │     │  (WebSocket)     │     │  Chart          │
│                 │     │                  │     │                 │
│  - 统计数据     │     │  - Dashboard     │     │  - 折线图       │
│  - 定时推送     │     │    Channel       │     │  - 实时更新     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## 常见问题

### 图表显示"等待数据..."

1. 检查 Job 是否已启动：`DashboardStatsJob.perform_later`
2. 检查日志是否有 `[DashboardStatsJob] Broadcasting` 输出
3. 检查 WebSocket 连接状态（浏览器控制台）

### 图表数据不变化

1. 确认 `calculate_value` 方法返回的值会变化
2. 检查推送间隔是否合理
3. 检查 ActionCable 连接是否正常

### 生产环境部署

确保 ActionCable 配置正确：

```yaml
# config/cable.yml
production:
  adapter: solid_cable  # 或 redis
```
