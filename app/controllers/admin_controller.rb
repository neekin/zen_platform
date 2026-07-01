# frozen_string_literal: true

class AdminController < InertiaController
  layout "admin"

  private

  def require_login
    redirect_to admin_login_path unless session[:user_id]
  end

  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end
  helper_method :current_user
end
