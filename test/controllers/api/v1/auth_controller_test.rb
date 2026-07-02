# frozen_string_literal: true

require "test_helper"

class Api::V1::AuthControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(
      username: "testuser",
      email: "test@example.com",
      password: "password123",
      name: "Test User"
    )
  end

  # --- Login 测试 ---

  test "login with valid credentials returns JWT token" do
    post api_v1_auth_login_url, params: { account: @user.email, password: "password123" }

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 0, json["code"]
    assert json["data"]["token"].present?
    assert json["data"]["user"]["id"] == @user.id
  end

  test "login with username returns JWT token" do
    post api_v1_auth_login_url, params: { account: @user.username, password: "password123" }

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 0, json["code"]
    assert json["data"]["token"].present?
  end

  test "login with invalid password returns unauthorized" do
    post api_v1_auth_login_url, params: { account: @user.email, password: "wrong_password" }

    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_equal 1, json["code"]
    assert_equal "账号或密码错误", json["message"]
  end

  test "login with nonexistent account returns unauthorized" do
    post api_v1_auth_login_url, params: { account: "nonexistent@example.com", password: "password123" }

    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_equal 1, json["code"]
  end

  # --- Me 测试 ---

  test "me with valid JWT returns current user" do
    # First login to get token
    post api_v1_auth_login_url, params: { account: @user.email, password: "password123" }
    json = JSON.parse(response.body)
    token = json["data"]["token"]

    # Then use token to get current user
    get api_v1_auth_me_url, headers: { "Authorization" => "Bearer #{token}" }

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal 0, json["code"]
    assert_equal @user.id, json["data"]["id"]
    assert_equal @user.username, json["data"]["username"]
  end

  test "me without token returns unauthorized" do
    get api_v1_auth_me_url

    assert_response :unauthorized
  end

  test "me with invalid token returns unauthorized" do
    get api_v1_auth_me_url, headers: { "Authorization" => "Bearer invalid_token" }

    assert_response :unauthorized
  end
end
