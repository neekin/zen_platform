# frozen_string_literal: true

module Api
  module ApiKeyAuthenticatable
    extend ActiveSupport::Concern

    def authenticate_api_key!
      key = request.headers["X-Api-Key"]
      api_key = ApiKey.active.find_by(key: key)
      @current_api_user = api_key&.user
      @current_api_user.present?
    end

    def current_api_user
      @current_api_user
    end
  end
end
