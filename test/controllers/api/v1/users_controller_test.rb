# frozen_string_literal: true

require "test_helper"

class Api::V1::UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      name: "Test User"
    )
    @api_key = @user.api_keys.create!(name: "test")
  end

  # --- ApiKey 认证测试 ---

  test "index with valid api key returns users" do
    get api_v1_users_url, headers: { "X-Api-Key" => @api_key.key }

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 0, json["code"]
    assert_kind_of Array, json["data"]
  end

  test "index with invalid api key returns unauthorized" do
    get api_v1_users_url, headers: { "X-Api-Key" => "wrong_key" }

    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_equal 1, json["code"]
  end

  test "index without api key returns unauthorized" do
    get api_v1_users_url

    assert_response :unauthorized
  end

  test "index with expired api key returns unauthorized" do
    expired_key = @user.api_keys.create!(name: "expired", expires_at: 1.day.ago)

    get api_v1_users_url, headers: { "X-Api-Key" => expired_key.key }

    assert_response :unauthorized
  end

  # --- show 测试 ---

  test "show with valid api key returns user" do
    get api_v1_user_url(@user), headers: { "X-Api-Key" => @api_key.key }

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 0, json["code"]
    assert_equal @user.username, json["data"]["username"]
  end

  test "show with nonexistent user returns error" do
    get api_v1_user_url(id: 0), headers: { "X-Api-Key" => @api_key.key }

    assert_response :not_found
    json = JSON.parse(response.body)
    assert_equal "用户不存在", json["message"]
  end
end
