# frozen_string_literal: true

module Api
  module JwtAuthenticatable
    extend ActiveSupport::Concern

    def authenticate_jwt!
      token = request.headers["Authorization"]&.split(" ")&.last
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

      # TODO: JWT.decode(token, Rails.application.secret_key_base, true, algorithm: "HS256").first
      {}
    rescue StandardError
      nil
    end
  end
end
