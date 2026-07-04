# frozen_string_literal: true

module Admin
  class DashboardController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def index
      render inertia: "admin/Dashboard", props: {
        stats: build_stats,
        recent_activities: recent_activities,
        framework: {
          name: "Zen Platform",
          version: File.read(Rails.root.join("VERSION")).strip,
          rails_version: Rails::VERSION::STRING,
          ruby_version: RUBY_VERSION
        }
      }
    end

    private

    def build_stats
      # 在这里添加你的统计卡片
      # 每个 stat: { label:, value:, icon: }
      # icon 可选: user, article, comment, rise, database
      stats = [
        { label: "用户总数", value: User.count, icon: "user" }
      ]

      # 自动发现 DSL 模型并添加统计
      ApplicationRecord.descendants.select { |m| m.respond_to?(:zen_display_config) && m.table_exists? }.each do |model|
        icon = case model.name
        when "Article" then "article"
        when "Comment" then "comment"
        else "database"
        end
        stats << { label: "#{model.model_name.human}总数", value: model.count, icon: icon }
      end

      stats << { label: "今日新增", value: User.where("created_at > ?", Date.today).count, icon: "rise" }
      stats
    end

    def recent_activities
      PaperTrail::Version.order(created_at: :desc).limit(5).map do |version|
        {
          id: version.id,
          event: version.event,
          item_type: version.item_type,
          item_id: version.item_id,
          whodunnit: version.whodunnit,
          created_at: version.created_at.iso8601
        }
      end
    rescue StandardError => e
      Rails.logger.debug { "[Dashboard] recent_activities error: #{e.message}" }
      []
    end
  end
end
