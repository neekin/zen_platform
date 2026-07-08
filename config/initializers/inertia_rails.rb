# frozen_string_literal: true

InertiaRails.configure do |config|
  if Rails.env.development?
    config.version = 'dev-fixed'  # 固定版本避免 Vite digest 不一致导致的 409
  else
    config.version = ViteRuby.digest
  end
  config.ssr_enabled = false
  config.always_include_errors_hash = true
  config.use_script_element_for_initial_page = true
  config.use_data_inertia_head_attribute = true
end
