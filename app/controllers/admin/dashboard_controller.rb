# frozen_string_literal: true

module Admin
  class DashboardController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def index
      render inertia: "admin/Dashboard", props: {
        stats: build_stats,
        chart_data: build_chart_data,
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
      stats = [{ label: "用户总数", value: User.count, icon: "user" }]

      dsl_models.each do |model|
        stats << {
          label: "#{model.model_name.human}总数",
          value: model.count,
          icon: model_icon(model),
        }
      end

      stats << { label: "今日新增", value: today_count, icon: "rise" }
      stats
    end

    def dsl_models
      @dsl_models ||= ApplicationRecord.descendants.select do |m|
        m.respond_to?(:zen_display_config) && m.table_exists?
      end
    end

    def model_icon(model)
      case model.name
      when "Article" then "article"
      when "Comment" then "comment"
      else "database"
      end
    end

    def today_count
      count = User.where("created_at > ?", Date.today).count
      dsl_models.each { |m| count += m.where("created_at > ?", Date.today).count }
      count
    end

    def build_chart_data
      model = dsl_models.first
      return [] unless model

      30.days.ago.to_date.upto(Date.today).map do |date|
        {
          date: date.iso8601,
          count: model.where("DATE(created_at) = ?", date).count,
        }
      end
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
  end
end
