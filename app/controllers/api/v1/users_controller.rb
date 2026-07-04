# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApiController
      include Api::ApiKeyAuthenticatable
      include Api::JwtAuthenticatable
      include Api::BearerTokenAuthenticatable
      include Api::SwaggerDocControllable

      swagger_tag "用户管理"

      before_action { authenticate_with :api_key, :jwt, :bearer_token }

      def index
        page = (params[:page] || 1).to_i
        per_page = (params[:per_page] || 20).to_i.clamp(1, 100)
        offset = (page - 1) * per_page

        users = User.offset(offset).limit(per_page)
        total = User.count

        render json: {
          code: 0,
          message: "成功",
          data: users.as_json(only: %i[id username email name]),
          meta: { page: page, per_page: per_page, total: total, total_pages: (total.to_f / per_page).ceil },
        }
      end

      def show
        user = User.find_by(id: params[:id])
        user ? render_success(user.as_json(only: %i[id username email name])) : render_error(message: "用户不存在", status: :not_found)
      end
    end
  end
end
