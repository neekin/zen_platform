# frozen_string_literal: true

module Admin
  class BigscreenController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def index
      render inertia: "admin/bigscreen/Index", props: {
        stats: build_stats,
        chart_data: initial_chart_data,
        recent_activities: recent_activities,
        framework: {
          name: Zen.configuration.app_name,
          version: File.read(Rails.root.join("VERSION")).strip,
        },
      }
    end

    private

    def build_stats
      [
        { label: "用户总数", value: User.count, icon: "user", color: "#D4A537" },
        { label: "今日新增", value: User.where("created_at > ?", Date.today).count, icon: "rise", color: "#52c41a" },
        { label: "本周新增", value: User.where("created_at > ?", 1.week.ago).count, icon: "active", color: "#1677FF" },
        { label: "数据表数量", value: ActiveRecord::Base.connection.tables.count, icon: "database", color: "#722ed1" },
      ]
    end

    def initial_chart_data
      10.downto(0).map do |i|
        time = i.minutes.ago
        {
          time: time.strftime("%H:%M"),
          value: User.where(created_at: (i + 1).minutes.ago..i.minutes.ago).count,
        }
      end
    rescue StandardError => e
      Rails.logger.debug { "[Bigscreen] chart_data error: #{e.message}" }
      []
    end

    def recent_activities
      PaperTrail::Version.order(created_at: :desc).limit(10).map do |version|
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
      Rails.logger.debug { "[Bigscreen] recent_activities error: #{e.message}" }
      []
    end
  end
end
