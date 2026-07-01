# frozen_string_literal: true

class InertiaController < ApplicationController
  inertia_share do
    {
      user: current_user&.as_json(only: %i[id name email]),
      flash: flash.to_hash.slice("notice", "alert").merge(ts: Time.current.to_f),
    }
  end

  private

  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end
end
