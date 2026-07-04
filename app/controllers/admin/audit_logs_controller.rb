# frozen_string_literal: true

module Admin
  class AuditLogsController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    # GET /admin/audit_logs
    def index
      page = (params[:page] || 1).to_i
      per_page = (params[:per_page] || 20).to_i.clamp(1, 100)
      offset = (page - 1) * per_page

      versions = PaperTrail::Version.order(created_at: :desc).offset(offset).limit(per_page)

      # Filters
      versions = versions.where(item_type: params[:item_type]) if params[:item_type].present?
      versions = versions.where(event: params[:event]) if params[:event].present?
      versions = versions.where(whodunnit: params[:whodunnit]) if params[:whodunnit].present?

      render inertia: "admin/audit_logs/Index",
        props: {
          audit_logs: versions.map { |v|
            {
              id: v.id,
              item_type: v.item_type,
              item_id: v.item_id,
              event: v.event,
              whodunnit: v.whodunnit,
              object_changes: safe_parse(v.object_changes),
              metadata: safe_parse(v.metadata),
              created_at: v.created_at.iso8601,
            }
          },
          filters: {
            item_types: PaperTrail::Version.distinct.pluck(:item_type).compact,
            events: PaperTrail::Version.distinct.pluck(:event).compact,
          },
        }
    end

    # GET /admin/audit_logs/:id
    def show
      version = PaperTrail::Version.find(params[:id])

      render inertia: "admin/audit_logs/Show",
        props: {
          audit_log: {
            id: version.id,
            item_type: version.item_type,
            item_id: version.item_id,
            event: version.event,
            whodunnit: version.whodunnit,
            object: safe_parse(version.object),
            object_changes: safe_parse(version.object_changes),
            metadata: safe_parse(version.metadata),
            created_at: version.created_at.iso8601,
          },
        }
    end

    private

    # PaperTrail 存储格式可能是 YAML 或 JSON，统一解析为 Hash
    def safe_parse(data)
      return nil if data.blank?

      if data.is_a?(String)
        if data.start_with?("---")
          YAML.safe_load(data, permitted_classes: [Time, Date, Symbol])
        else
          JSON.parse(data)
        end
      else
        data
      end
    rescue StandardError
      nil
    end
  end
end
