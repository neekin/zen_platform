# frozen_string_literal: true

module Api
  module V1
    class AuthController < ApiController
      include Api::JwtAuthenticatable
      include Api::SwaggerDocControllable

      swagger_tag "认证管理"

      def login
        user = User.find_by_account(params[:account])

        if user&.authenticate(params[:password])
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
    end
  end
end
