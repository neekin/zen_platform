# frozen_string_literal: true

module Api
  module V1
    class PaymentController < ApiController
      include Api::SignatureAuthenticatable
      include Api::SwaggerDocControllable

      swagger_tag "支付管理"

      before_action { authenticate_only :signature }

      def create
        render_success message: "支付创建成功"
      end
    end
  end
end
