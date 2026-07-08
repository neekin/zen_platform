# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApiController
      include Api::ApiKeyAuthenticatable
      include Api::JwtAuthenticatable
      include Api::BearerTokenAuthenticatable
      include Api::SwaggerDocControllable

      skip_before_action :require_authentication

      swagger_tag "用户管理"

      before_action { authenticate_with :api_key, :jwt, :bearer_token }

      def index
        result = UserResource.list(params, view_name: :api)
        # Result#to_json 返回完整的 {code, message, data, meta} 结构
        render json: result.to_json
      end

      def show
        result = UserResource.find(params[:id], view_name: :api)
        if result
          render json: result.to_json
        else
          render_error(message: "用户不存在", status: :not_found)
        end
      end

      def association_data
        result = UserResource.association_data(
          params[:id],
          params[:name].to_sym,
          params,
          view_name: :api
        )
        if result.success?
          render json: result.to_json
        else
          render json: result.to_error_json, status: :unprocessable_entity
        end
      end
    end
  end
end
