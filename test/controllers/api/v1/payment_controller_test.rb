# frozen_string_literal: true

require "test_helper"

class Api::V1::PaymentControllerTest < ActionDispatch::IntegrationTest
  # --- Signature 认证测试 ---

  test "create without signature returns unauthorized" do
    post api_v1_payment_index_url

    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_equal 1, json["code"]
  end

  test "create with invalid signature returns unauthorized" do
    post api_v1_payment_index_url, headers: {
      "X-App-Id" => "test_app",
      "X-Signature" => "invalid_signature",
      "X-Timestamp" => Time.current.to_i.to_s
    }

    assert_response :unauthorized
  end

  test "create with expired timestamp returns unauthorized" do
    old_timestamp = (Time.current.to_i - 600).to_s

    post api_v1_payment_index_url, headers: {
      "X-App-Id" => "test_app",
      "X-Signature" => "any_signature",
      "X-Timestamp" => old_timestamp
    }

    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_equal "请求已过期", json["message"]
  end
end
