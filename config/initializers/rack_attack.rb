# frozen_string_literal: true

# Rack::Attack 配置
# 用于 API 限流和防止滥用
# 测试环境中禁用

return if Rails.env.test?

class Rack::Attack
  ### Configure Cache ###

  # 使用 Rails 缓存存储
  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new

  ### Throttle Strategies ###

  # 基于 IP 的通用限流
  # 每分钟最多 300 个请求
  throttle("req/ip", limit: 300, period: 1.minute) do |req|
    req.ip unless req.path.start_with?("/assets", "/packs")
  end

  # API 限流：每分钟最多 60 个请求
  throttle("api/ip", limit: 60, period: 1.minute) do |req|
    req.ip if req.path.start_with?("/api/")
  end

  # 登录限流：每 5 分钟最多 5 次尝试
  throttle("logins/ip", limit: 5, period: 5.minutes) do |req|
    req.ip if req.path == "/admin/login" && req.post?
  end

  # 工作流 API 限流：每分钟最多 30 个请求
  throttle("workflow/api", limit: 30, period: 1.minute) do |req|
    req.ip if req.path.start_with?("/admin/workflow/") && req.post?
  end

  # 工作流启动限流：每分钟最多 10 个请求
  throttle("workflow/start", limit: 10, period: 1.minute) do |req|
    req.ip if req.path.match?(%r{/admin/workflow/.*/start})
  end

  ### Custom Response ###

  # 自定义限流响应
  self.throttled_responder = lambda do |req|
    match_data = req.env["rack.attack.match_data"]
    now = match_data[:epoch_time]

    headers = {
      "Content-Type" => "application/json",
      "Retry-After" => (match_data[:period] - (now % match_data[:period])).to_s,
      "X-RateLimit-Limit" => match_data[:limit].to_s,
      "X-RateLimit-Remaining" => "0",
      "X-RateLimit-Reset" => (now + (match_data[:period] - now % match_data[:period])).to_s
    }

    body = {
      error: "rate_limit_exceeded",
      message: "请求过于频繁，请稍后再试",
      retry_after: headers["Retry-After"].to_i
    }

    [429, headers, [body.to_json]]
  end

  ### Track ###

  # 跟踪可疑请求（用于监控）
  track("suspicious/ip") do |req|
    req.ip if req.env["rack.attack.matched"]
  end

  ### ActiveSupport Notifications ###

  # 记录限流事件
  ActiveSupport::Notifications.subscribe("throttle.rack_attack") do |_name, _start, _finish, _id, payload|
    req = payload[:request]
    Rails.logger.warn(
      "[Rack::Attack] Throttled #{req.ip} on #{req.path} " \
      "(#{req.env['rack.attack.match_type']}: #{req.env['rack.attack.matched']})"
    )
  end
end
