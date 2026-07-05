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
  filter={(d) => d.value > 0} // 可选：过滤数据
/>
```

**Props：**

| 属性 | 说明 | 默认值 |
|------|------|--------|
| `initialData` | 初始数据 | `[]` |
| `title` | 图表标题 | `'实时数据趋势'` |
| `yFieldLabel` | Y 轴标签 | `'数值'` |
| `color` | 图表颜色 | `'#D4A537'` |
| `filter` | 数据过滤函数 | - |

### useSharedSubscription

**路径：** `app/frontend/hooks/useSharedSubscription.ts`

多个图表共享一个 WebSocket 连接：

```tsx
import { useSharedSubscription } from '@/hooks/useSharedSubscription'

function MyChart() {
  const { data, connected } = useSharedSubscription('DashboardChannel')

  // data 是最新收到的消息数组
  // connected 是连接状态
}
```

**优势：**
- 多图表只用 1 个 WebSocket 连接
- 组件卸载自动清理
- 无订阅者时自动断开

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

前端 `useSharedSubscription` hook 接收此数据并添加到图表。

## 架构

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────────┐
│  DashboardStats │────▶│  ActionCable     │────▶│  useSharedSubscription  │
│  Job            │     │  (WebSocket)     │     │  (全局单例)              │
│                 │     │                  │     │                         │
│  - 统计数据     │     │  - Dashboard     │     │  - 订阅者管理            │
│  - 定时推送     │     │    Channel       │     │  - 自动清理              │
└─────────────────┘     └──────────────────┘     └─────────────────────────┘
                                                           │
                         ┌─────────────────────────────────┼─────────────────┐
                         ▼                                 ▼                 ▼
                    ┌────────┐                        ┌────────┐       ┌────────┐
                    │Chart 1 │                        │Chart 2 │       │Chart 3 │
                    └────────┘                        └────────┘       └────────┘
```

**关键点：**
- 多图表共享 1 个 WebSocket 连接
- 全局 consumer 单例，按 Channel 管理订阅者
- 组件卸载时自动清理，无订阅者时断开连接

## 大屏模式

访问 `/admin/bigscreen` 可进入大屏模式：

- 无侧边栏，全屏深色主题
- 实时趋势图
- 统计卡片
- 最近活动
- 全屏切换按钮

Dashboard 页面有"大屏模式"入口按钮。

## 常见问题

### 图表显示"等待数据..."

1. 检查 Job 是否已启动：`DashboardStatsJob.perform_later`
2. 检查日志是否有 `[DashboardStatsJob] Broadcasting` 输出
3. 检查 WebSocket 连接状态（浏览器控制台）

### 图表数据不变化

1. 确认 `calculate_value` 方法返回的值会变化
2. 检查推送间隔是否合理
3. 检查 ActionCable 连接是否正常

### 多图表性能问题

使用 `useSharedSubscription` hook 而非单独订阅，共享连接：

```tsx
// ✅ 推荐：共享连接
const { data } = useSharedSubscription('DashboardChannel')

// ❌ 不推荐：每个图表单独连接
const consumer = createConsumer(cableUrl)
consumer.subscriptions.create(...)
```

### 生产环境部署

确保 ActionCable 配置正确：

```yaml
# config/cable.yml
production:
  adapter: solid_cable  # 或 redis
```
