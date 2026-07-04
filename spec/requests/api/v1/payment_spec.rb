# frozen_string_literal: true

require "swagger_helper"

RSpec.describe "Api::V1::Payment", type: :request do
  path "/api/v1/payment" do
    post "创建支付" do
      tags "支付管理"
      consumes "application/json"
      produces "application/json"
      security [ signature: [] ]

      parameter name: :"X-App-Id", in: :header, type: :string, required: true
      parameter name: :"X-Timestamp", in: :header, type: :string, required: true
      parameter name: :"X-Signature", in: :header, type: :string, required: true

      response "200", "支付创建成功" do
        schema type: :object,
          properties: {
            code: { type: :integer },
            message: { type: :string }
          }

        let(:app_id) { "test_app" }
        let(:timestamp) { Time.current.to_i.to_s }
        let(:api_secret) { "test_secret" }

        before do
          allow(Rails.application.credentials).to receive(:dig).with(:api_secrets, app_id.to_sym).and_return(api_secret)
        end

        let(:"X-App-Id") { app_id }
        let(:"X-Timestamp") { timestamp }
        let(:"X-Signature") { OpenSSL::HMAC.hexdigest("SHA256", api_secret, "#{timestamp}\n") }

        run_test!
      end

      response "401", "未授权" do
        schema type: :object,
          properties: {
            code: { type: :integer },
            message: { type: :string }
          }

        let(:"X-App-Id") { "test_app" }
        let(:"X-Timestamp") { Time.current.to_i.to_s }
        let(:"X-Signature") { "invalid_signature" }

        run_test!
      end
    end
  end
end
