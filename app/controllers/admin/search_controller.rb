# frozen_string_literal: true

module Admin
  class SearchController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    # GET /admin/search?q=keyword
    def index
      query = params[:q].to_s.strip
      results = []

      if query.present?
        Zen.searchable_models.each do |model_class|
          results.concat(search_in_model(model_class, query))
        end
      end

      menu_items = search_menu_items(query)

      render json: {
        records: results.first(20),
        menus: menu_items,
        actions: quick_actions(query)
      }
    end

    private

    def search_in_model(model_class, query)
      searchable_fields = model_class.zen_display_config.dig(:list, :searchable_fields)
      return [] unless searchable_fields.is_a?(Array) && searchable_fields.present?

      conditions = searchable_fields.map { |f| "#{f} LIKE :q" }.join(" OR ")
      records = model_class.where(conditions, q: "%#{query}%").limit(5)

      records.map do |record|
        {
          id: record.id,
          model: model_class.name,
          title: record.send(searchable_fields.first).to_s,
          subtitle: model_class.model_name.human,
          url: "/admin/#{model_class.model_name.collection}/#{record.id}"
        }
      end
    rescue StandardError => e
      Rails.logger.debug { "[Search] #{model_class} error: #{e.message}" }
      []
    end

    def search_menu_items(query)
      [
        { title: "仪表盘", url: "/admin/dashboard", icon: "dashboard" },
        { title: "用户管理", url: "/admin/users", icon: "users" },
        { title: "角色管理", url: "/admin/roles", icon: "team" },
        { title: "权限管理", url: "/admin/permissions", icon: "safety" },
        { title: "API Key", url: "/admin/api_keys", icon: "key" },
        { title: "审计日志", url: "/admin/audit_logs", icon: "audit" }
      ].select { |m| query.blank? || m[:title].include?(query) }
    end

    def quick_actions(query)
      actions = []
      query.present? ? actions.select { |a| a[:title].include?(query) } : []
    end
  end
end
