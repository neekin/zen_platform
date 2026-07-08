# frozen_string_literal: true

require_relative "../../lib/zen/configuration"

Zen.configure do |config|
  config.app_name = "Zen Platform"
  config.logo = "/logo-mark.svg"
  config.primary_color = "#D4A537"
  config.sidebar_mode = :mix
end
