# frozen_string_literal: true

module Api
  module JwtAuthenticatable
    extend ActiveSupport::Concern

    ALGORITHM = "HS256"

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

    def encode_jwt(user_id, exp = 24.hours.from_now)
      payload = { user_id: user_id, exp: exp.to_i }
      JWT.encode(payload, jwt_secret, ALGORITHM)
    end

    def decode_jwt(token)
      return nil if token.blank?

      decoded = JWT.decode(token, jwt_secret, true, algorithm: ALGORITHM)
      decoded.first
    rescue JWT::DecodeError, JWT::ExpiredSignature
      nil
    end

    def jwt_secret
      Rails.application.secret_key_base
    end
  end
end
