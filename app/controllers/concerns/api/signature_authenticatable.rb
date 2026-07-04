# frozen_string_literal: true

module Api
  module SignatureAuthenticatable
    extend ActiveSupport::Concern

    def authenticate_signature!
      request.body.rewind
      app_id = request.headers["X-App-Id"]
      signature = request.headers["X-Signature"]
      timestamp = request.headers["X-Timestamp"]

      return false if app_id.blank? || signature.blank? || timestamp.blank?

      if (Time.current.to_i - timestamp.to_i).abs > 300
        @auth_error = "请求已过期"
        return false
      end

      api_secret = Rails.application.credentials.dig(:api_secrets, app_id.to_sym)
      return false if api_secret.blank?
      return false unless valid_signature?(signature, timestamp, api_secret)

      @current_api_app = app_id
      true
    end

    def current_api_app
      @current_api_app
    end

    private

    def valid_signature?(signature, timestamp, api_secret)
      expected = OpenSSL::HMAC.hexdigest("SHA256", api_secret, "#{timestamp}\n#{request.raw_post}")
      ActiveSupport::SecurityUtils.secure_compare(signature, expected)
    end
  end
end
