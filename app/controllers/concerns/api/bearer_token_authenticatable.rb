# frozen_string_literal: true

module Api
  module BearerTokenAuthenticatable
    extend ActiveSupport::Concern
    include Api::JwtAuthenticatable

    def authenticate_bearer_token!
      token = request.headers["Authorization"]&.split(" ")&.last
      return false if token.blank?

      payload = decode_jwt(token)
      @current_api_user = User.find_by(id: payload&.dig("user_id"))
      @current_api_user.present?
    end

    def current_api_user
      @current_api_user
    end
  end
end
