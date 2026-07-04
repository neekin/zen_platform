# frozen_string_literal: true

class NotificationService
  def self.notify(recipient:, actor: nil, action:, notifiable: nil, metadata: {})
    notification = Notification.create!(
      recipient: recipient,
      actor: actor,
      action: action,
      notifiable: notifiable,
      metadata: metadata.to_json,
    )

    NotificationChannel.broadcast_to(
      recipient,
      {
        type: "notification",
        notification: notification.as_json(include: { actor: { only: [ :id, :name ] } })
      }
    )

    notification
  end

  def self.notify_role(role_name, actor: nil, action:, notifiable: nil, metadata: {})
    User.with_role(role_name).each do |user|
      notify(
        recipient: user,
        actor: actor,
        action: action,
        notifiable: notifiable,
        metadata: metadata,
      )
    end
  end
end
