# Be sure to restart your server when you modify this file.

Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self, :https
    policy.font_src    :self, :https, :data
    policy.img_src     :self, :https, :data, :blob
    policy.object_src  :none
    policy.style_src   :self, :https, :unsafe_inline

    if Rails.env.production?
      policy.script_src :self, :https, :nonce
      policy.frame_ancestors :none
    else
      # Development: allow Vite dev server + HMR
      policy.script_src :self, :https, :unsafe_inline, :unsafe_eval, :blob:
      policy.connect_src :self, :https, "http://#{ViteRuby.config.host_with_port}", "ws://#{ViteRuby.config.host_with_port}"
    end
  end

  # Production: use nonce for scripts
  if Rails.env.production?
    config.content_security_policy_nonce_generator = ->(_request) { SecureRandom.base64(16) }
    config.content_security_policy_nonce_directives = %w[script-src]
  else
    # Development: disable nonce entirely
    config.content_security_policy_nonce_generator = nil
    config.content_security_policy_nonce_directives = []
  end
end
