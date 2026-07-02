# frozen_string_literal: true

require "swagger_helper"

RSpec.describe "Api::V1::Users", type: :request do
  path "/api/v1/users" do
    get "获取用户列表" do
      tags "用户管理"
      produces "application/json"
      security [api_key: [], bearer_auth: []]

      parameter name: :"X-Api-Key", in: :header, type: :string, required: false
      parameter name: :Authorization, in: :header, type: :string, required: false

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
                  username: { type: :string },
                  email: { type: :string },
                  name: { type: :string }
                }
              }
            }
          }

        let(:user) { User.create!(username: "testuser", email: "test@example.com", password: "password123", name: "Test User") }
        let(:api_key) { user.api_keys.create!(name: "test") }
        let(:"X-Api-Key") { api_key.key }
        let(:Authorization) { nil }

        run_test!
      end

      response "401", "未授权" do
        schema type: :object,
          properties: {
            code: { type: :integer },
            message: { type: :string }
          }

        let(:"X-Api-Key") { "invalid_key" }
        let(:Authorization) { nil }

        run_test!
      end
    end
  end

  path "/api/v1/users/{id}" do
    get "获取用户详情" do
      tags "用户管理"
      produces "application/json"
      security [api_key: [], bearer_auth: []]

      parameter name: :id, in: :path, type: :integer, description: "用户ID"
      parameter name: :"X-Api-Key", in: :header, type: :string, required: false
      parameter name: :Authorization, in: :header, type: :string, required: false

      response "200", "成功" do
        schema type: :object,
          properties: {
            code: { type: :integer },
            message: { type: :string },
            data: {
              type: :object,
              properties: {
                id: { type: :integer },
                username: { type: :string },
                email: { type: :string },
                name: { type: :string }
              }
            }
          }

        let(:user) { User.create!(username: "testuser", email: "test@example.com", password: "password123", name: "Test User") }
        let(:api_key) { user.api_keys.create!(name: "test") }
        let(:"X-Api-Key") { api_key.key }
        let(:Authorization) { nil }
        let(:id) { user.id }

        run_test!
      end

      response "404", "用户不存在" do
        schema type: :object,
          properties: {
            code: { type: :integer },
            message: { type: :string }
          }

        let(:user) { User.create!(username: "testuser", email: "test@example.com", password: "password123", name: "Test User") }
        let(:api_key) { user.api_keys.create!(name: "test") }
        let(:"X-Api-Key") { api_key.key }
        let(:Authorization) { nil }
        let(:id) { 0 }

        run_test!
      end
    end
  end
end
