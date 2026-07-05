# frozen_string_literal: true

# Dashboard 实时数据推送 Job
#
# 单个 Channel，通过 type 字段区分不同数据源
# 不同数据源可以有不同的推送间隔
#
# ==============================================
#  数据格式
# ==============================================
#
# {
#   type: "trend",      # 数据类型
#   time: "12:00:00",   # 时间戳
#   value: 42            # 数值
# }
#
# ==============================================
class DashboardStatsJob < ApplicationJob
  queue_as :default

  after_perform do
    Rails.cache.write("dashboard_stats_job_running", true, expires_in: 2.minutes)
    self.class.set(wait: 30.seconds).perform_later
  end

  def perform
    # 每次都推送用户趋势（30秒间隔）
    push_data("trend", calculate_trend_value)

    # 每分钟推送订单数据
    push_data("orders", calculate_order_value) if Time.current.sec < 30

    # 每5分钟推送收入数据
    push_data("revenue", calculate_revenue_value) if Time.current.min % 5 == 0
  end

  private

  # 统一推送方法：单个 Channel，不同 type
  def push_data(type, value)
    data = {
      type: type,
      time: Time.current.strftime("%H:%M:%S"),
      value: value,
    }
    ActionCable.server.broadcast("dashboard", data)
    Rails.logger.info("[DashboardStatsJob] #{type}: #{data.inspect}")
  end

  def calculate_trend_value
    rand(20..80)
  end

  def calculate_order_value
    rand(5..30)
  end

  def calculate_revenue_value
    rand(1000..5000)
  end
end
