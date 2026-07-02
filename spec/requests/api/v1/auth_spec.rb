# frozen_string_literal: true

require "swagger_helper"

RSpec.describe "Api::V1::Auth", type: :request do
  path "/api/v1/auth/login" do
    post "用户登录" do
      tags "认证管理"
      consumes "application/json"
      produces "application/json"

      parameter name: :account, in: :query, type: :string, description: "邮箱或用户名"
      parameter name: :password, in: :query, type: :string, description: "密码"

      response "200", "登录成功" do
        schema type: :object,
          properties: {
            code: { type: :integer },
            message: { type: :string },
            data: {
              type: :object,
              properties: {
                token: { type: :string },
                user: {
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
          }

        let(:user) { User.create!(username: "testuser", email: "test@example.com", password: "password123", name: "Test User") }
        let(:account) { user.email }
        let(:password) { "password123" }

        run_test!
      end

      response "401", "登录失败" do
        schema type: :object,
          properties: {
            code: { type: :integer },
            message: { type: :string }
          }

        let(:account) { "wrong@example.com" }
        let(:password) { "wrong_password" }

        run_test!
      end
    end
  end

  path "/api/v1/auth/me" do
    get "获取当前用户" do
      tags "认证管理"
      produces "application/json"
      security [bearer_auth: []]

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
        let(:Authorization) { "Bearer #{JWT.encode({ user_id: user.id }, Rails.application.secret_key_base, 'HS256')}" }

        run_test!
      end

      response "401", "未授权" do
        schema type: :object,
          properties: {
            code: { type: :integer },
            message: { type: :string }
          }

        let(:Authorization) { "Bearer invalid_token" }

        run_test!
      end
    end
  end
end
