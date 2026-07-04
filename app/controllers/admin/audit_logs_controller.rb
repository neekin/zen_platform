# frozen_string_literal: true

module Admin
  class AuditLogsController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped
    before_action :authorize_restore, only: [:restore]

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

    # POST /admin/audit_logs/:id/restore
    def restore
      version = PaperTrail::Version.find(params[:id])

      case version.event
      when "create"
        # 创建事件 → 删除记录（撤销创建）
        record = version.item_type.constantize.find_by(id: version.item_id)
        if record
          record.destroy!
          render json: { code: 0, message: "已删除该记录（还原创建操作）" }
        else
          render json: { code: 1, message: "记录已不存在" }, status: :unprocessable_entity
        end

      when "update"
        # 更新事件 → 手动还原到该版本
        object = YAML.unsafe_load(version.object)
        record = version.item_type.constantize.find_by(id: version.item_id)
        if record
          # 移除不能更新的字段
          object.delete("id")
          object.delete("created_at")
          object.delete("updated_at")
          
          if record.update(object)
            render json: { code: 0, message: "已还原到该版本" }
          else
            render json: { code: 1, message: record.errors.full_messages.join(", ") }, status: :unprocessable_entity
          end
        else
          render json: { code: 1, message: "记录已不存在" }, status: :unprocessable_entity
        end

      when "destroy"
        # 删除事件 → 手动重新创建
        object = YAML.unsafe_load(version.object)
        record = version.item_type.constantize.new(object)
        record.id = version.item_id  # 恢复原始 ID
        
        if record.save
          render json: { code: 0, message: "已重新创建该记录" }
        else
          render json: { code: 1, message: record.errors.full_messages.join(", ") }, status: :unprocessable_entity
        end

      else
        render json: { code: 1, message: "不支持的操作类型" }, status: :unprocessable_entity
      end
    rescue ActiveRecord::RecordNotFound
      render json: { code: 1, message: "版本记录不存在" }, status: :not_found
    rescue StandardError => e
      render json: { code: 1, message: e.message }, status: :internal_server_error
    end

    private

    def authorize_restore
      unless current_user.has_role?(:super_admin) || current_user.has_role?(:admin)
        render json: { code: 1, message: "没有权限执行还原操作" }, status: :forbidden
        return  # 重要：阻止后续代码执行
      end
    end

    # PaperTrail 存储格式可能是 YAML 或 JSON，统一解析为 Hash
    def safe_parse(data)
      return nil if data.blank?

      if data.is_a?(String)
        if data.start_with?("---")
          YAML.unsafe_load(data)
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
