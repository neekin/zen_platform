# frozen_string_literal: true

module Admin
  class ExportsController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    # 可导出的资源列表 — 用户自行添加业务模型名称
    ALLOWED_EXPORT_RESOURCES = [].freeze
    ALLOWED_EXPORT_FORMATS = %w[csv xlsx pdf].freeze

    # POST /admin/exports
    def create
      unless ALLOWED_EXPORT_RESOURCES.include?(params[:resource])
        redirect_back fallback_location: admin_root_path, alert: "不允许导出此资源"
        return
      end

      unless ALLOWED_EXPORT_FORMATS.include?(params[:format])
        redirect_back fallback_location: admin_root_path, alert: "不支持的导出格式"
        return
      end

      ExportService.export(
        resource: params[:resource],
        format: params[:format],
        user: current_user,
        filters: params[:filters] || {},
      )

      redirect_back fallback_location: admin_root_path,
        notice: "导出任务已创建，完成后将通知您"
    end

    # GET /admin/exports/:id
    def show
      export = current_user.exports.find(params[:id])

      if export.completed? && export.file_path.present?
        storage_root = Rails.root.join("storage").to_s
        resolved_path = File.expand_path(export.file_path)

        unless resolved_path.start_with?(storage_root + "/")
          redirect_to admin_root_path, alert: "非法文件路径"
          return
        end

        unless File.exist?(resolved_path)
          redirect_to admin_root_path, alert: "文件不存在"
          return
        end

        send_file resolved_path,
          filename: File.basename(export.file_path),
          disposition: "attachment"
      else
        redirect_back fallback_location: admin_root_path,
          alert: export.failed? ? "导出失败: #{export.error_message}" : "导出进行中..."
      end
    end
  end
end
