# frozen_string_literal: true

module Admin
  class DashboardController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def index
      # 启动实时数据推送 Job（如果尚未运行）
      ensure_stats_job_running

      render inertia: "admin/Dashboard", props: {
        stats: build_stats,
        chart_data: initial_chart_data,
        recent_activities: recent_activities,
        framework: {
          name: "Zen Platform",
          version: File.read(Rails.root.join("VERSION")).strip,
          rails_version: Rails::VERSION::STRING,
          ruby_version: RUBY_VERSION,
        },
      }
    end

    private

    def build_stats
      stats = [
        { label: "用户总数", value: User.count, icon: "user" },
        { label: "今日新增", value: User.where("created_at > ?", Date.today).count, icon: "rise" },
      ]

      stats
    end

    # 初始图表数据（最近 10 个数据点）
    def initial_chart_data
      10.downto(0).map do |i|
        time = i.minutes.ago
        {
          time: time.strftime("%H:%M"),
          value: User.where(created_at: (i + 1).minutes.ago..i.minutes.ago).count,
        }
      end
    rescue StandardError => e
      Rails.logger.debug { "[Dashboard] chart_data error: #{e.message}" }
      []
    end

    def recent_activities
      PaperTrail::Version.order(created_at: :desc).limit(5).map do |version|
        {
          id: version.id,
          event: version.event,
          item_type: version.item_type,
          item_id: version.item_id,
          whodunnit: version.whodunnit,
          created_at: version.created_at.iso8601,
        }
      end
    rescue StandardError => e
      Rails.logger.debug { "[Dashboard] recent_activities error: #{e.message}" }
      []
    end

    # 确保定时推送 Job 正在运行
    def ensure_stats_job_running
      # 如果缓存中没有运行标记，则启动 Job
      return if Rails.cache.read("dashboard_stats_job_running").present?

      DashboardStatsJob.perform_later
      Rails.cache.write("dashboard_stats_job_running", true, expires_in: 2.minutes)
      Rails.logger.info("[Dashboard] Started DashboardStatsJob")
    rescue StandardError => e
      Rails.logger.debug { "[Dashboard] Job enqueue error: #{e.message}" }
    end
  end
end
