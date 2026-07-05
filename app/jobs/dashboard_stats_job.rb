# frozen_string_literal: true

# Dashboard 实时数据推送 Job
#
# 定时统计数据并推送到前端实时趋势图
#
# ==============================================
#  使用方式
# ==============================================
#
# 1. 手动触发：
#    DashboardStatsJob.perform_now
#
# 2. 定时执行：
#    DashboardStatsJob.perform_later
#
# 3. 自定义统计逻辑：
#    修改 stats 方法，返回你想要的统计数据
#
# ==============================================
class DashboardStatsJob < ApplicationJob
  queue_as :default

  # 防止重复执行
  after_perform do
    # 标记 Job 运行状态
    Rails.cache.write("dashboard_stats_job_running", true, expires_in: 2.minutes)

    # 每 30 秒执行一次
    self.class.set(wait: 30.seconds).perform_later
  end

  def perform
    data = stats

    Rails.logger.info("[DashboardStatsJob] Broadcasting: #{data.inspect}")
    ActionCable.server.broadcast("dashboard_trend", data)
  end

  private

  # ============================================
  #  入口：自定义统计逻辑
  # ============================================
  #
  # 返回格式：
  # {
  #   time: "12:00:00",  # 时间戳
  #   value: 42           # 数值
  # }
  #
  # 示例统计：
  # - User.count — 用户总数
  # - User.where("created_at > ?", 1.hour.ago).count — 最近 1 小时新增
  # - PaperTrail::Version.where("created_at > ?", 5.minutes.ago).count — 最近操作数
  def stats
    {
      time: Time.current.strftime("%H:%M:%S"),
      value: calculate_value,
    }
  end

  # 统计逻辑
  # 示例：返回随机值（开发演示用）
  # 生产环境替换为你的实际统计，例如：
  #   User.count
  #   RequestLog.where("created_at > ?", 1.minute.ago).count
  #   Sidekiq::Stats.new.enqueued
  def calculate_value
    rand(20..80)
  end
end
