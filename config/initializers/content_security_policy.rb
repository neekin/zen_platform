# Be sure to restart your server when you modify this file.

Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self, :https
    policy.font_src    :self, :https, :data
    policy.img_src     :self, :https, :data, :blob
    policy.object_src  :none
    if Rails.env.production?
      policy.style_src :self, :https, :nonce
      policy.script_src :self, :https, :nonce
      policy.frame_ancestors :none
    else
      # Development: allow Vite dev server + HMR + ActionCable WebSocket
      vite_host = "http://#{ViteRuby.config.host_with_port}"
      policy.style_src :self, :https, :unsafe_inline
      policy.script_src :self, :https, :unsafe_inline, :unsafe_eval, :blob, vite_host
      policy.connect_src :self, :https, :http, vite_host,
                         "ws://#{ViteRuby.config.host_with_port}",
                         "ws://localhost:3100", "ws://127.0.0.1:3100",
                         "ws://localhost:3000", "ws://127.0.0.1:3000",
                         "zen_platform.test"
    end
  end

  # Production: use nonce for scripts
  if Rails.env.production?
    config.content_security_policy_nonce_generator = ->(_request) { SecureRandom.base64(16) }
    config.content_security_policy_nonce_directives = %w[script-src style-src]
  else
    # Development: disable nonce entirely
    config.content_security_policy_nonce_generator = nil
    config.content_security_policy_nonce_directives = []
  end
end
