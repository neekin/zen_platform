# frozen_string_literal: true

module Admin
  class DashboardController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    def index
      render inertia: "admin/Dashboard", props: {
        stats: {
          user_count: User.count,
          article_count: defined?(Article) ? Article.count : 0,
          comment_count: defined?(Comment) ? Comment.count : 0,
          today_count: today_count,
        },
        chart_data: articles_trend_data,
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

    def today_count
      User.where("created_at > ?", Date.today).count +
        (defined?(Article) ? Article.where("created_at > ?", Date.today).count : 0)
    end

    def articles_trend_data
      return [] unless defined?(Article)

      30.days.ago.to_date.upto(Date.today).map do |date|
        {
          date: date.iso8601,
          count: Article.where("DATE(created_at) = ?", date).count,
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
