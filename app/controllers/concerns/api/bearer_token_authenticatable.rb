# frozen_string_literal: true

module Api
  module BearerTokenAuthenticatable
    extend ActiveSupport::Concern

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

    private

    def decode_jwt(token)
      return nil if token.blank?

      decoded = JWT.decode(token, Rails.application.secret_key_base, true, algorithm: "HS256")
      decoded.first
    rescue JWT::DecodeError, JWT::ExpiredSignature
      nil
    end
  end
end
