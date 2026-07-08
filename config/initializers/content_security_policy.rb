# Be sure to restart your server when you modify this file.

Rails.application.configure do
  if Rails.env.production?
    # Production: strict CSP
    config.content_security_policy do |policy|
      policy.default_src :self, :https
      policy.font_src    :self, :https, :data
      policy.img_src     :self, :https, :data, :blob
      policy.object_src  :none
      policy.style_src :self, :https, :nonce
      policy.script_src :self, :https, :nonce
      policy.frame_ancestors :none
    end

    # Production: use nonce for scripts
    config.content_security_policy_nonce_generator = ->(_request) { SecureRandom.base64(16) }
    config.content_security_policy_nonce_directives = %w[script-src style-src]
  end
  # Development: no CSP configured — Vite HMR + cloudflared need unrestricted WebSocket
end
