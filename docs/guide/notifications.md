# 通知系统

Zen Platform 内置通知系统，提供 `NotificationService` 快捷函数集，方便二开时发送通知。

## 架构概览

```
触发方（控制器/回调/Job）
        │
        ▼
NotificationService.notify_***   ← 快捷函数 API
        │
        ▼
Notification 记录（数据库）
        │
        ▼
NotificationChannel（ActionCable WebSocket）
        │
        ▼
前端 NotificationBell 组件（铃铛 + 下拉列表）
```

## 数据模型

`Notification` 模型字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `recipient_id` | integer | 接收者（User） |
| `actor_id` | integer | 触发者（User，可为空表示系统通知） |
| `action` | string | 通知动作类型，如 `order_created`、`commented` |
| `notifiable_type` | string | 关联对象类型（多态） |
| `notifiable_id` | integer | 关联对象 ID |
| `metadata` | text | JSON 格式的额外元数据 |
| `read` | boolean | 是否已读，默认 `false` |

## 快捷函数

所有方法定义在 `app/services/notification_service.rb`。

### `notify` — 给单个用户发通知

```ruby
NotificationService.notify(
  recipient: user,
  actor: current_user,
  action: "order_created",
  notifiable: order,
  metadata: { amount: 99.9 }
)
```

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `recipient` | User | 是 | 接收者 |
| `actor` | User | 否 | 触发者，nil 表示系统通知 |
| `action` | String/Symbol | 是 | 通知动作类型 |
| `notifiable` | ActiveRecord | 否 | 关联对象（订单、评论等） |
| `metadata` | Hash | 否 | 额外元数据，自动转 JSON |

返回创建的 `Notification` 记录。

### `notify_users` — 给多个用户发通知（自动去重）

```ruby
NotificationService.notify_users(
  recipients: [user1, user2, user3],
  actor: current_user,
  action: "announcement",
  metadata: { title: "系统升级公告" }
)
```

- 接收数组或单个 User 对象
- 按 `user.id` 自动去重
- 返回 `Array<Notification>`

### `notify_role` — 给特定角色的用户发通知

```ruby
NotificationService.notify_role("admin", action: "system_alert", actor: security_bot)
```

- 参数为角色名（String 或 Symbol）
- 内部用 `User.with_role` 查询
- 返回 `Array<Notification>`

### `notify_roles` — 给多个角色的用户发通知（自动去重）

```ruby
NotificationService.notify_roles(["admin", "editor"], action: "release_published", notifiable: release)
```

- 一个用户同时拥有多个指定角色时**只收到一条通知**
- 内部用 `User.joins(:roles).distinct` 去重
- 返回 `Array<Notification>`

### `notify_admins` — 给所有管理员发通知

```ruby
NotificationService.notify_admins(action: "security_incident", actor: monitor_bot)
```

- 等价于 `notify_roles(["super_admin", "admin"], ...)`
- 管理员角色定义在 `NotificationService::ADMIN_ROLES` 常量

### `notify_all` — 给所有用户发通知

```ruby
NotificationService.notify_all(action: "maintenance_scheduled", metadata: { time: "2026-07-05 03:00" })
```

::: warning 谨慎使用
用户量大时会批量创建大量记录。如需给上千用户发通知，建议改为后台 Job 异步执行。
:::

### `notify_all_except` — 给除指定用户外的所有用户发通知

```ruby
NotificationService.notify_all_except(current_user, actor: current_user, action: "user_logged_in")
```

- 常见场景：用户执行了某操作，需通知其他人但不通知自己
- `excluded` 接收单个 User 或 User 数组

## 使用场景示例

### 商城系统

```ruby
# app/controllers/admin/orders_controller.rb
class Admin::OrdersController < AdminController
  def create
    @order = Order.new(order_params)
    if @order.save
      # 通知买家
      NotificationService.notify(
        recipient: @order.user,
        actor: current_user,
        action: "order_created",
        notifiable: @order,
        metadata: { order_no: @order.no, amount: @order.amount }
      )

      # 通知所有管理员有新订单
      NotificationService.notify_admins(
        actor: current_user,
        action: "new_order",
        notifiable: @order
      )

      redirect_to admin_order_path(@order), notice: "订单创建成功"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def ship
    @order = Order.find(params[:id])
    @order.update!(status: :shipped, shipped_at: Time.current)

    # 通知买家订单已发货
    NotificationService.notify(
      recipient: @order.user,
      actor: current_user,
      action: "order_shipped",
      notifiable: @order,
      metadata: { tracking_no: @order.tracking_no, carrier: @order.carrier }
    )

    redirect_to admin_order_path(@order), notice: "已标记发货"
  end
end
```

### ERP 系统

```ruby
# app/models/purchase_request.rb
class PurchaseRequest < ApplicationRecord
  belongs_to :requester, class_name: "User"
  belongs_to :approver, class_name: "User", optional: true

  after_update :notify_on_approval, if: :saved_change_to_status?

  private

  def notify_on_approval
    if status == "approved"
      NotificationService.notify(
        recipient: requester,
        actor: approver,
        action: "purchase_approved",
        notifiable: self,
        metadata: { amount: amount, approved_at: Time.current.iso8601 }
      )
    elsif status == "rejected"
      NotificationService.notify(
        recipient: requester,
        actor: approver,
        action: "purchase_rejected",
        notifiable: self,
        metadata: { reason: rejection_reason }
      )
    end
  end
end

# 库存预警 — 通知采购部门所有成员
class InventoryAlert
  def self.check_and_notify
    Product.where("stock <= threshold").find_each do |product|
      NotificationService.notify_role(
        "purchaser",
        action: "low_stock",
        notifiable: product,
        metadata: { stock: product.stock, threshold: product.threshold }
      )
    end
  end
end
```

### 评论 / @提及系统

```ruby
# 通知文章作者有新评论
def notify_article_author(comment)
  NotificationService.notify(
    recipient: comment.article.author,
    actor: comment.user,
    action: "commented",
    notifiable: comment,
    metadata: { article_title: comment.article.title }
  )
end

# @提及 — 通知被提及的用户（排除评论者自己）
def notify_mentioned_users(comment, mentioned_users)
  NotificationService.notify_users(
    recipients: mentioned_users,
    actor: comment.user,
    action: "mentioned",
    notifiable: comment,
    metadata: { content_preview: comment.content.truncate(50) }
  )
end
```

### 系统公告

```ruby
class Admin::AnnouncementsController < AdminController
  def publish
    @announcement = Announcement.find(params[:id])
    @announcement.update!(published: true, published_at: Time.current)

    # 通知所有用户
    NotificationService.notify_all(
      actor: current_user,
      action: "announcement",
      notifiable: @announcement,
      metadata: { title: @announcement.title }
    )

    redirect_to admin_announcement_path(@announcement), notice: "公告已发布"
  end
end
```

## 在回调中使用

通知可以在模型回调中自动触发，减少控制器代码：

```ruby
class Order < ApplicationRecord
  belongs_to :user

  after_create :notify_customer

  private

  def notify_customer
    NotificationService.notify(
      recipient: user,
      action: "order_created",
      notifiable: self,
      metadata: { order_no: no, amount: amount }
    )
  end
end
```

::: tip 推荐做法
对于跨模型的通知，建议在控制器或 Service Object 中显式调用，而非模型回调。模型回调会让测试变复杂，也容易在数据迁移时意外触发通知。
:::

## 在后台 Job 中使用

批量通知建议放入 Job 异步执行，避免阻塞请求：

```ruby
class BulkNotificationJob < ApplicationJob
  queue_as :default

  def perform(action, metadata, role_names = nil)
    if role_names
      NotificationService.notify_roles(role_names, action: action, metadata: metadata)
    else
      NotificationService.notify_all(action: action, metadata: metadata)
    end
  end
end

# 控制器中
BulkNotificationJob.perform_later("promotion_started", { coupon: "SUMMER20" }, ["vip", "gold"])
```

## WebSocket 实时推送

`NotificationService` 会通过 ActionCable 推送实时通知。即使 WebSocket 连接失败，通知也会存入数据库，用户刷新页面后可见。

### 前端订阅

前端 `NotificationBell` 组件已集成 WebSocket 订阅逻辑（连接状态用铃铛旁的小圆点显示，绿色=已连接，橙色=连接中）。如需在其他组件接收实时通知：

```typescript
import { useNotifications } from '@/hooks/useNotifications'

function MyComponent() {
  const { notifications, unreadCount, connected } = useNotifications()
  // connected 为 true 表示 WebSocket 已连接
}
```

### 后端配置

ActionCable 已挂载到 `/cable` 路由（见 `config/routes.rb`）。

- 开发环境：`async` adapter（单进程内有效，从控制器触发的通知可实时推送）
- 生产环境：`solid_cable`（基于 PostgreSQL，无需 Redis）

### 频道

通知频道 `NotificationChannel` 按 `current_user` 隔离，每个用户只收到发给自己的通知。

### 调试 WebSocket 连接

1. 打开浏览器开发者工具 → Network → WS 标签
2. 应该能看到一个到 `/cable` 的 WebSocket 连接（状态 101 Switching Protocols）
3. 点击连接，Frames 标签会显示订阅和推送的消息
4. 铃铛图标旁的小圆点：绿色=已连接，橙色=连接中/断开

### 开发环境的限制

开发环境用 `async` adapter，只在同一个 Rails 进程内有效。这意味着：
- ✅ 从浏览器触发的控制器请求 → 通知会实时推送
- ❌ 从 `bin/rails console` 终端触发的通知 → 浏览器看不到（不同进程）

如需在 console 测试实时推送，使用 web console（在控制器 action 或 ERB 视图中加 `console`）。

## 数据查询

```ruby
# 当前用户未读通知
current_user.notifications.unread

# 当前用户最近 50 条通知
current_user.notifications.recent

# 标记单条已读
notification.mark_as_read!

# 标记全部已读
current_user.notifications.unread.update_all(read: true)

# 按动作类型筛选
current_user.notifications.where(action: "order_created")

# 按关联对象筛选
Notification.where(notifiable: @order)
Notification.where(notifiable_type: "Order", notifiable_id: @order.id)
```

## 最佳实践

### 1. action 命名规范

使用 `<resource>_<verb>` 蛇形命名：

- `order_created` / `order_updated` / `order_shipped` / `order_cancelled`
- `comment_created` / `comment_replied`
- `user_registered` / `user_logged_in`
- `payment_received` / `payment_failed`
- `mention_created`

### 2. metadata 约定

存入可在前端直接展示的关键信息，避免前端再查库：

```ruby
metadata: {
  title: "订单 #20260704001",        # 通知标题
  body: "您的订单已发货",              # 通知正文
  url: "/admin/orders/1",            # 点击跳转链接
  icon: "shopping_cart",             # 图标（前端可选渲染）
  priority: "high"                   # 优先级（前端可选高亮）
}
```

### 3. 避免通知轰炸

- 同一事件不要同时调用多个 notify 方法
- 批量操作（如导入 1000 条数据）不要逐条通知，改为汇总通知
- 用户可配置接收哪些类型的通知（可扩展 `notification_preferences` 表）

### 4. 定期清理

通知表会持续增长，建议定期归档：

```ruby
# 删除 90 天前的已读通知
Notification.where(read: true).where("created_at < ?", 90.days.ago).delete_all

# 作为定时任务
class NotificationCleanupJob < ApplicationJob
  def perform
    Notification.where(read: true).where("created_at < ?", 90.days.ago).delete_all
  end
end
```

## API 速查表

| 方法 | 用途 | 返回值 |
| --- | --- | --- |
| `notify(recipient:, action:, **)` | 给单个用户发通知 | `Notification` |
| `notify_users(recipients:, action:, **)` | 给多个用户发通知（去重） | `Array<Notification>` |
| `notify_role(role_name, action:, **)` | 给特定角色用户发通知 | `Array<Notification>` |
| `notify_roles(role_names, action:, **)` | 给多个角色用户发通知（去重） | `Array<Notification>` |
| `notify_admins(action:, **)` | 给所有管理员发通知 | `Array<Notification>` |
| `notify_all(action:, **)` | 给所有用户发通知 | `Array<Notification>` |
| `notify_all_except(excluded, action:, **)` | 给除指定用户外的所有人发通知 | `Array<Notification>` |

`**` 表示可选参数 `actor:`、`notifiable:`、`metadata:`。
