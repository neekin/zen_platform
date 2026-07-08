# frozen_string_literal: true

# 通知服务 — 提供发送通知的快捷函数
#
# 使用示例：
#   # 1. 给单个用户发通知
#   NotificationService.notify(recipient: user, action: "order_created", actor: current_user, notifiable: order)
#
#   # 2. 给多个用户发通知（自动去重）
#   NotificationService.notify_users(recipients: [user1, user2], action: "message_sent", actor: sender)
#
#   # 3. 给特定角色的用户发通知
#   NotificationService.notify_role("admin", action: "system_alert", actor: system)
#
#   # 4. 给多个角色发通知（自动去重，一个用户有多个角色只收一次）
#   NotificationService.notify_roles(["admin", "editor"], action: "release_published", notifiable: release)
#
#   # 5. 给所有管理员发通知（super_admin + admin）
#   NotificationService.notify_admins(action: "security_incident", actor: security_bot)
#
#   # 6. 给所有用户发通知
#   NotificationService.notify_all(action: "maintenance_scheduled", metadata: { time: "2026-07-05 03:00" })
#
#   # 7. 给除指定用户外的所有用户发通知（常见：某操作不通知操作者自己）
#   NotificationService.notify_all_except(current_user, action: "user_logged_in", actor: current_user)
#
class NotificationService
  # 管理员角色（notify_admins 使用）
  ADMIN_ROLES = %w[super_admin admin].freeze

  # 给单个用户发通知
  #
  # @param recipient [User] 接收者
  # @param actor [User, nil] 触发者（谁导致的通知）
  # @param action [String, Symbol] 通知动作类型，如 "order_created"、"commented"
  # @param notifiable [ActiveRecord::Base, nil] 关联对象（订单、评论等）
  # @param metadata [Hash] 额外元数据
  # @return [Notification] 创建的通知记录
  def self.notify(recipient:, actor: nil, action:, notifiable: nil, metadata: {})
    notification = Notification.create!(
      recipient: recipient,
      actor: actor,
      action: action.to_s,
      notifiable: notifiable,
      metadata: metadata.to_json
    )

    broadcast(recipient, notification)
    notification
  end

  # 给多个用户发通知（自动去重）
  #
  # @param recipients [Enumerable<User>] 接收者集合
  # @param actor [User, nil] 触发者
  # @param action [String, Symbol] 通知动作
  # @param notifiable [ActiveRecord::Base, nil] 关联对象
  # @param metadata [Hash] 额外元数据
  # @return [Array<Notification>] 创建的通知记录数组
  def self.notify_users(recipients:, actor: nil, action:, notifiable: nil, metadata: {})
    recipients = Array(recipients).uniq(&:id)
    recipients.map do |recipient|
      notify(
        recipient: recipient,
        actor: actor,
        action: action,
        notifiable: notifiable,
        metadata: metadata
      )
    end
  end

  # 给特定角色的所有用户发通知
  #
  # @param role_name [String, Symbol] 角色名，如 "admin"、"editor"
  # @param actor [User, nil] 触发者
  # @param action [String, Symbol] 通知动作
  # @param notifiable [ActiveRecord::Base, nil] 关联对象
  # @param metadata [Hash] 额外元数据
  # @return [Array<Notification>] 创建的通知记录数组
  def self.notify_role(role_name, actor: nil, action:, notifiable: nil, metadata: {})
    users = User.with_role(role_name.to_s)
    notify_users(
      recipients: users,
      actor: actor,
      action: action,
      notifiable: notifiable,
      metadata: metadata
    )
  end

  # 给多个角色的所有用户发通知（自动去重）
  #
  # 一个用户同时拥有多个指定角色时只收到一条通知。
  #
  # @param role_names [Array<String, Symbol>] 角色名数组
  # @param actor [User, nil] 触发者
  # @param action [String, Symbol] 通知动作
  # @param notifiable [ActiveRecord::Base, nil] 关联对象
  # @param metadata [Hash] 额外元数据
  # @return [Array<Notification>] 创建的通知记录数组
  def self.notify_roles(role_names, actor: nil, action:, notifiable: nil, metadata: {})
    role_names = Array(role_names).map(&:to_s)
    users = User.joins(:roles).where(roles: { name: role_names }).distinct
    notify_users(
      recipients: users,
      actor: actor,
      action: action,
      notifiable: notifiable,
      metadata: metadata
    )
  end

  # 给所有管理员发通知（super_admin + admin 角色）
  #
  # @param actor [User, nil] 触发者
  # @param action [String, Symbol] 通知动作
  # @param notifiable [ActiveRecord::Base, nil] 关联对象
  # @param metadata [Hash] 额外元数据
  # @return [Array<Notification>] 创建的通知记录数组
  def self.notify_admins(actor: nil, action:, notifiable: nil, metadata: {})
    notify_roles(ADMIN_ROLES, actor: actor, action: action, notifiable: notifiable, metadata: metadata)
  end

  # 给所有用户发通知
  #
  # 谨慎使用：用户量大时可能产生大量通知记录。
  #
  # @param actor [User, nil] 触发者
  # @param action [String, Symbol] 通知动作
  # @param notifiable [ActiveRecord::Base, nil] 关联对象
  # @param metadata [Hash] 额外元数据
  # @return [Array<Notification>] 创建的通知记录数组
  def self.notify_all(actor: nil, action:, notifiable: nil, metadata: {})
    notify_users(
      recipients: User.all,
      actor: actor,
      action: action,
      notifiable: notifiable,
      metadata: metadata
    )
  end

  # 给除指定用户外的所有用户发通知
  #
  # 常见场景：用户执行了某操作，需要通知其他人但不通知自己。
  #
  # @param excluded [User, Array<User>] 要排除的用户
  # @param actor [User, nil] 触发者
  # @param action [String, Symbol] 通知动作
  # @param notifiable [ActiveRecord::Base, nil] 关联对象
  # @param metadata [Hash] 额外元数据
  # @return [Array<Notification>] 创建的通知记录数组
  def self.notify_all_except(excluded, actor: nil, action:, notifiable: nil, metadata: {})
    excluded_ids = Array(excluded).map(&:id)
    recipients = User.where.not(id: excluded_ids)
    notify_users(
      recipients: recipients,
      actor: actor,
      action: action,
      notifiable: notifiable,
      metadata: metadata
    )
  end

  # 广播通知到用户的 WebSocket 频道
  #
  # 如果 ActionCable 未配置或不可用，静默失败（通知记录已存入数据库，刷新后可见）。
  def self.broadcast(recipient, notification)
    NotificationChannel.broadcast_to(
      recipient,
      type: "notification",
      notification: notification.as_json(include: { actor: { only: %i[id name] } })
    )
  rescue => e
    Rails.logger.debug { "[NotificationService] broadcast failed: #{e.message}" }
  end
end
