# frozen_string_literal: true

InertiaRails.configure do |config|
  # Inertia.js v2 默认启用 history encryption，需要 SSL
  # 开发环境使用 HTTP（puma-dev）时需要禁用
  config.encrypt_history = Rails.env.production?
end
