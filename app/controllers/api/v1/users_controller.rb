# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApiController
      include Api::ApiKeyAuthenticatable
      include Api::JwtAuthenticatable
      include Api::BearerTokenAuthenticatable

      before_action { authenticate_with :api_key, :jwt, :bearer_token }

      def index
        render_success User.all.as_json(only: %i[id username email name])
      end

      def show
        user = User.find_by(id: params[:id])
        user ? render_success(user) : render_error(message: "用户不存在", status: :not_found)
      end
    end
  end
end
