# frozen_string_literal: true

module Api
  module V1
    class AuthController < ApiController
      include Api::JwtAuthenticatable
      include Api::SwaggerDocControllable

      skip_before_action :require_authentication
      before_action -> { authenticate_with(:jwt) }, only: [:me]

      swagger_tag "认证管理"

      def login
        user = User.find_by_account(auth_params[:account])

        if user&.authenticate(auth_params[:password])
          token = encode_jwt(user.id)
          render_success({ token: token, user: user.as_json(only: %i[id username email name]) })
        else
          render_error(message: "账号或密码错误", status: :unauthorized)
        end
      end

      def me
        authenticate_with :jwt
        return unless @current_api_user

        render_success(@current_api_user.as_json(only: %i[id username email name]))
      end

      private

      def auth_params
        params.permit(:account, :password)
      end
    end
  end
end
