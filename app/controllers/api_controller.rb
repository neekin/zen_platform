# frozen_string_literal: true

class ApiController < ActionController::API
  private

  # 混合认证：按顺序尝试，任一通过即可
  # authenticate_with :api_key, :jwt
  def authenticate_with(*strategies)
    authenticated = strategies.any? { |s| send("authenticate_#{s}!") }

    unless authenticated
      render json: { code: 1, message: "未授权" }, status: :unauthorized
      return false
    end

    true
  end

  # 单一认证：必须通过指定方式
  # authenticate_only :signature
  def authenticate_only(strategy)
    result = send("authenticate_#{strategy}!")
    return if result

    error_msg = instance_variable_get(:@auth_error) || "未授权"
    render_unauthorized(message: error_msg)
  end

  def render_unauthorized(message: "未授权")
    render json: { code: 1, message: message }, status: :unauthorized
  end

  def render_success(data = nil, message: "成功")
    render json: { code: 0, message: message, data: data }
  end

  def render_error(message: "请求失败", status: :bad_request)
    render json: { code: 1, message: message }, status: status
  end
end
