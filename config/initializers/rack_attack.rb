# frozen_string_literal: true

# Rack::Attack configuration for rate limiting
# See: https://github.com/rack/rack-attack

# Use Rails cache store for throttle storage
Rack::Attack.cache.store = Rails.cache

# --- Tier 1: Global API throttle ---
Rack::Attack.throttle("api/requests/ip", limit: 60, period: 60) do |req|
  req.ip if req.path.start_with?("/api/")
end

# --- Tier 2: Authenticated API key gets higher limit ---
Rack::Attack.throttle("api/requests/key", limit: 300, period: 60) do |req|
  req.env["HTTP_X_API_KEY"]
end

# --- Tier 3: Admin UI ---
Rack::Attack.throttle("admin/requests/ip", limit: 300, period: 60) do |req|
  req.ip if req.path.start_with?("/admin/")
end

# --- Tier 4: Login endpoints (brute force protection) ---
Rack::Attack.throttle("logins/ip", limit: 5, period: 20) do |req|
  req.ip if req.path == "/admin/login" && req.post?
end

Rack::Attack.throttle("api/logins/ip", limit: 10, period: 60) do |req|
  req.ip if req.path == "/api/v1/auth/login" && req.post?
end

# --- Block known bad actors ---
Rack::Attack.blocklist("block/bad-agents") do |req|
  Rack::Attack::Fail2Ban.filter("pentesters-#{req.ip}", maxretry: 3, findtime: 10.minutes, bantime: 1.hour) do
    req.path.include?("/etc/passwd") || req.path.include?("/wp-admin")
  end
end

# --- Throttled response with rate limit headers ---
Rack::Attack.throttled_responder = lambda do |req|
  match_data = req.env["rack.attack.match_data"]
  now = match_data[:epoch_time]
  headers = {
    "Content-Type" => "application/json",
    "Retry-After" => (match_data[:period] - (now % match_data[:period])).to_s,
    "X-RateLimit-Limit" => match_data[:limit].to_s,
    "X-RateLimit-Remaining" => "0",
    "X-RateLimit-Reset" => (now + (match_data[:period] - now % match_data[:period])).to_s
  }
  body = { error: "Rate limit exceeded. Retry later." }.to_json
  [ 429, headers, [ body ] ]
end
