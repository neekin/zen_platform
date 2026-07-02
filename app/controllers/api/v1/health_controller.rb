# frozen_string_literal: true

module Api
  module V1
    class HealthController < ApiController
      include Api::SwaggerDocControllable
      swagger_doc false  # 内部监控，不暴露到 Swagger

      def check
        render_success({ status: "ok", time: Time.current.iso8601 })
      end
    end
  end
end
