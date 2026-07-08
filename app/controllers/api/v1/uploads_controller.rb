# frozen_string_literal: true

module Api
  module V1
    class UploadsController < ApiController
      skip_before_action :require_authentication, only: [:create]
      # POST /api/v1/uploads
      def create
        unless params[:file].present?
          return render_error(message: "请选择文件")
        end

        file = params[:file]
        
        # 验证文件大小 (最大 10MB)
        if file.size > 10.megabytes
          return render_error(message: "文件大小不能超过 10MB")
        end

        # 使用 ActiveStorage 保存文件
        blob = ActiveStorage::Blob.create_and_upload!(
          io: file.tempfile,
          filename: file.original_filename,
          content_type: file.content_type
        )

        render_success({
          id: blob.id,
          url: rails_blob_url(blob, only_path: true),
          filename: blob.filename.to_s,
          content_type: blob.content_type
        })
      rescue => e
        Rails.logger.error("[UploadsController] 文件上传失败: #{e.message}")
        render_error(message: "文件上传失败: #{e.message}")
      end
    end
  end
end