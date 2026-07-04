# frozen_string_literal: true

module Api
  module V1
    class PaymentController < ApiController
      include Api::SignatureAuthenticatable
      include Api::SwaggerDocControllable

      swagger_tag "支付管理"

      before_action { authenticate_only :signature }

      def create
        # TODO: 当需要实现支付功能时，使用 payment_params 来限制允许的参数
        render_success message: "支付创建成功"
      end

      private

      def payment_params
        params.require(:payment).permit(:amount, :currency, :description)
      end
    end
  end
end
