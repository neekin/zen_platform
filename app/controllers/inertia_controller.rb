# frozen_string_literal: true

class InertiaController < ApplicationController
  inertia_share do
    {
      user: current_user ? {
        id: current_user.id,
        name: current_user.name,
        email: current_user.email,
        avatar: current_user.avatar.attached? ? url_for(current_user.avatar) : nil,
        roles: current_user.roles.pluck(:name)
      } : nil,
      flash: flash.to_hash.slice("notice", "alert").merge(ts: Time.current.to_f),
      zen_config: {
        app_name: Zen.configuration.app_name,
        logo: Zen.configuration.logo,
        primary_color: Zen.configuration.primary_color,
        sidebar_mode: Zen.configuration.sidebar_mode.to_s
      }
    }
  end

  private

  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end
end
