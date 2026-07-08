# frozen_string_literal: true

module Admin
  class NotificationsController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    # GET /admin/notifications
    def index
      notifications = current_user.notifications.recent

      render inertia: "admin/notifications/Index",
        props: {
          notifications: notifications.as_json(include: { actor: { only: [ :id, :name ] } }),
          unread_count: current_user.notifications.unread.count
        }
    end

    # POST /admin/notifications/:id/mark_as_read
    def mark_as_read
      notification = current_user.notifications.find(params[:id])
      notification.mark_as_read!

      render json: { ok: true }
    end

    # POST /admin/notifications/mark_all_as_read
    def mark_all_as_read
      current_user.notifications.unread.update_all(read: true)

      render json: { ok: true }
    end
  end
end
