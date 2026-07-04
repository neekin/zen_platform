# frozen_string_literal: true

module Admin
  class AuditLogsController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped
    before_action :authorize_restore, only: [ :restore ]

    ALLOWED_RESTORE_TYPES = %w[User Role ApiKey Export Notification Task Product Permission].freeze

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
              created_at: v.created_at.iso8601
            }
          },
          filters: {
            item_types: PaperTrail::Version.distinct.pluck(:item_type).compact,
            events: PaperTrail::Version.distinct.pluck(:event).compact
          }
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
            created_at: version.created_at.iso8601
          }
        }
    end

    # POST /admin/audit_logs/:id/restore
    def restore
      version = PaperTrail::Version.find(params[:id])

      unless ALLOWED_RESTORE_TYPES.include?(version.item_type)
        render json: { code: 1, message: "不支持恢复此类型: #{version.item_type}" }, status: :unprocessable_entity
        return
      end

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
        # 更新事件 → 还原到该版本
        if version.object.present?
          object = safe_load_yaml(version.object)
        elsif version.object_changes.present?
          # object 为空时，用 object_changes 反推
          changes = safe_load_yaml(version.object_changes)
          object = {}
          changes&.each { |key, (old_val, _)| object[key] = old_val }
        else
          render json: { code: 1, message: "无法还原：版本数据为空" }, status: :unprocessable_entity
          return
        end

        record = version.item_type.constantize.find_by(id: version.item_id)
        if record
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
        # 删除事件 → 重新创建
        if version.object.blank?
          render json: { code: 1, message: "无法还原：版本数据为空" }, status: :unprocessable_entity
          return
        end
        object = safe_load_yaml(version.object)
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
        nil  # 重要：阻止后续代码执行
      end
    end

    # PaperTrail 存储格式为 YAML（可能包含 Ruby 对象）
    # 使用 safe_load 并明确指定允许的类（白名单）
    # 注意：数据来源是自己的数据库，但是为了安全起见，我们仍然使用白名单
    PERMITTED_YAML_CLASSES = [
      ActiveSupport::TimeWithZone,
      ActiveSupport::TimeZone,
      Symbol,
      Time,
      Date,
      DateTime,
      Hash,
      Array,
      String,
      Integer,
      Float,
      BigDecimal,
      TrueClass,
      FalseClass,
      NilClass,
      ActiveSupport::Duration,
      ActiveSupport::HashWithIndifferentAccess,
      ActiveSupport::SafeBuffer,
      Regexp,
      Range,
      Set
    ].freeze

    def safe_parse(data)
      return nil if data.blank?

      if data.is_a?(String)
        if data.start_with?("---")
          YAML.safe_load(data, permitted_classes: PERMITTED_YAML_CLASSES, aliases: true)
        else
          JSON.parse(data)
        end
      else
        data
      end
    rescue Psych::DisallowedClass => e
      # 如果遇到新的未知类，记录到日志并返回 nil
      Rails.logger.warn("PaperTrail YAML 反序列化遇到未知类: #{e.message}")
      nil
    rescue StandardError => e
      Rails.logger.warn("PaperTrail YAML 解析失败: #{e.message}")
      nil
    end

    # 安全地加载 YAML（用于恢复操作，需要完整反序列化）
    def safe_load_yaml(yaml_string)
      YAML.safe_load(yaml_string, permitted_classes: PERMITTED_YAML_CLASSES, aliases: true)
    rescue Psych::DisallowedClass => e
      Rails.logger.warn("PaperTrail YAML 反序列化遇到未知类: #{e.message}")
      nil
    rescue StandardError => e
      Rails.logger.warn("PaperTrail YAML 解析失败: #{e.message}")
      nil
    end
  end
end
