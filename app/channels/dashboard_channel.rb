# frozen_string_literal: true

# Dashboard 实时数据 Channel
#
# ==============================================
#  开发者指南：如何推送实时数据
# ==============================================
#
# 1. 在你的业务逻辑中推送数据：
#
#    ActionCable.server.broadcast("dashboard_trend", {
#      time: Time.current.strftime("%H:%M:%S"),
#      value: SomeModel.count
#    })
#
# 2. 或者创建定时任务推送：
#
#    # app/jobs/dashboard_stats_job.rb
#    class DashboardStatsJob < ApplicationJob
#      def perform
#        ActionCable.server.broadcast("dashboard_trend", {
#          time: Time.current.strftime("%H:%M:%S"),
#          value: RequestLog.where("created_at > ?", 1.minute.ago).count
#        })
#        self.class.set(wait: 1.minute).perform_later
#      end
#    end
#
# ==============================================
class DashboardChannel < ApplicationCable::Channel
  def subscribed
    stream_from "dashboard_trend"
  end

  def unsubscribed
    # 清理资源
  end
end
