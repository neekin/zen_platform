# frozen_string_literal: true

class ApiController < ActionController::API
  before_action :set_request_start
  before_action :check_api_version
  after_action :track_api_metrics

  private

  # 混合认证：按顺序尝试，任一通过即可
  # authenticate_with :api_key, :jwt
  def authenticate_with(*strategies)
    @_auth_strategy = strategies.first
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
    @_auth_strategy = strategy
    result = send("authenticate_#{strategy}!")
    return if result

    error_msg = instance_variable_get(:@auth_error) || "未授权"
    render_unauthorized(message: error_msg)
  end

  def set_request_start
    @_request_start = Time.current
  end

  def check_api_version
    requested_version = request.headers["Accept-Version"]
    if requested_version && requested_version.to_i > 1
      render_error("API version #{requested_version} not supported", status: :not_acceptable)
    end
  end

  def track_api_metrics
    return unless @_request_start

    Rails.logger.info({
      event: "api_request",
      path: request.path,
      method: request.method,
      status: response.status,
      duration_ms: ((Time.current - @_request_start) * 1000).round(2),
      auth_strategy: @_auth_strategy,
    }.to_json)
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
