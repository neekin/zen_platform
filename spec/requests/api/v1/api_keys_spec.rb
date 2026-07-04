# frozen_string_literal: true

require "swagger_helper"

RSpec.describe "Api::V1::ApiKeys", type: :request do
  path "/api/v1/api_keys" do
    get "获取当前用户的 API Key 列表" do
      tags "API Key 管理"
      produces "application/json"
      security [ bearer_auth: [] ]

      parameter name: :Authorization, in: :header, type: :string, required: true

      response "200", "成功" do
        schema type: :object,
          properties: {
            code: { type: :integer },
            message: { type: :string },
            data: {
              type: :array,
              items: {
                type: :object,
                properties: {
                  id: { type: :integer },
                  name: { type: :string },
                  key_masked: { type: :string },
                  expires_at: { type: :string, nullable: true },
                  expired: { type: :boolean },
                  created_at: { type: :string }
                }
              }
            }
          }

        let(:user) { User.create!(username: "testuser", email: "test@example.com", password: "password123", name: "Test User") }
        let(:api_key) { user.api_keys.create!(name: "test") }
        let(:Authorization) { "Bearer #{JWT.encode({ user_id: user.id }, Rails.application.secret_key_base, "HS256") }" }

        run_test!
      end
    end

    post "创建新的 API Key" do
      tags "API Key 管理"
      produces "application/json"
      consumes "application/json"
      security [ bearer_auth: [] ]

      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :api_key, in: :body, schema: {
        type: :object,
        properties: {
          name: { type: :string },
          expires_at: { type: :string, nullable: true }
        },
        required: [ "name" ]
      }

      response "200", "创建成功" do
        schema type: :object,
          properties: {
            code: { type: :integer },
            message: { type: :string },
            data: {
              type: :object,
              properties: {
                id: { type: :integer },
                name: { type: :string },
                key: { type: :string },
                expires_at: { type: :string, nullable: true },
                created_at: { type: :string }
              }
            }
          }

        let(:user) { User.create!(username: "testuser", email: "test@example.com", password: "password123", name: "Test User") }
        let(:Authorization) { "Bearer #{JWT.encode({ user_id: user.id }, Rails.application.secret_key_base, "HS256") }" }
        let(:api_key) { { name: "My Key" } }

        run_test!
      end
    end
  end

  path "/api/v1/api_keys/{id}" do
    delete "删除 API Key" do
      tags "API Key 管理"
      produces "application/json"
      security [ bearer_auth: [] ]

      parameter name: :Authorization, in: :header, type: :string, required: true
      parameter name: :id, in: :path, type: :integer, required: true

      response "200", "删除成功" do
        schema type: :object,
          properties: {
            code: { type: :integer },
            message: { type: :string }
          }

        let(:user) { User.create!(username: "testuser", email: "test@example.com", password: "password123", name: "Test User") }
        let(:api_key) { user.api_keys.create!(name: "test") }
        let(:Authorization) { "Bearer #{JWT.encode({ user_id: user.id }, Rails.application.secret_key_base, "HS256") }" }
        let(:id) { api_key.id }

        run_test!
      end
    end
  end
end
