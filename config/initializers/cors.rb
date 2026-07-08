# frozen_string_literal: true

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch("ALLOWED_ORIGINS", "").split(",").reject(&:blank?).presence || ["http://localhost:3000", "http://localhost:5173"]

    resource "/api/*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options ],
      credentials: true,
      expose: [ "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset" ],
      max_age: 600
  end
end
