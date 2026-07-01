# frozen_string_literal: true

module Api
  module BearerTokenAuthenticatable
    extend ActiveSupport::Concern

    def authenticate_bearer_token!
      token = request.headers["Authorization"]&.split(" ")&.last
      return false if token.blank?

      @current_api_user = User.find_by(access_token: token)
      @current_api_user.present?
    end

    def current_api_user
      @current_api_user
    end
  end
end
