# frozen_string_literal: true

if defined?(Bullet)
  Bullet.enable        = Rails.env.development?
  Bullet.alert         = Rails.env.development?
  Bullet.bullet_logger = true
  Bullet.console       = true
  Bullet.rails_logger  = true
  Bullet.add_footer    = true
end
