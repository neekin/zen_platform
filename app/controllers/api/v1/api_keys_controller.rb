# frozen_string_literal: true

module Api
  module V1
    class ApiKeysController < ApiController
      include Api::JwtAuthenticatable
      include Api::SwaggerDocControllable

      skip_before_action :require_authentication

      swagger_tag "API Key 管理"

      before_action { authenticate_with :jwt }

      # GET /api/v1/api_keys
      def index
        keys = current_api_user.api_keys.order(created_at: :desc)
        render_success(keys.map { |k|
          {
            id: k.id,
            name: k.name,
            key_masked: mask_key(k.key),
            expires_at: k.expires_at&.iso8601,
            expired: k.expired?,
            created_at: k.created_at.iso8601
          }
        })
      end

      # POST /api/v1/api_keys
      def create
        api_key = current_api_user.api_keys.new(api_key_params)
        if api_key.save
          render_success({
            id: api_key.id,
            name: api_key.name,
            key: api_key.key,
            expires_at: api_key.expires_at&.iso8601,
            created_at: api_key.created_at.iso8601
          }, message: "创建成功，请妥善保存 Key，此后无法再次查看")
        else
          render_error(message: api_key.errors.full_messages.join(", "))
        end
      end

      # DELETE /api/v1/api_keys/:id
      def destroy
        api_key = current_api_user.api_keys.find_by(id: params[:id])
        if api_key
          api_key.destroy!
          render_success(message: "删除成功")
        else
          render_error(message: "API Key 不存在或无权操作", status: :not_found)
        end
      end

      private

      def api_key_params
        params.require(:api_key).permit(:name, :expires_at)
      end

      def mask_key(key)
        return "" if key.blank?
        "#{key[0..7]}...#{key[-4..]}"
      end
    end
  end
end
