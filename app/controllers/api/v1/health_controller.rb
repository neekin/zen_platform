# frozen_string_literal: true

module Api
  module V1
    class HealthController < ApiController
      def check
        render_success({ status: "ok", time: Time.current.iso8601 })
      end
    end
  end
end
