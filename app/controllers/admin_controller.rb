# frozen_string_literal: true

class AdminController < InertiaController
  include Pundit::Authorization
  include Zen::MetaSerializable

  layout "admin"

  before_action :recover_session_from_cookie
  before_action :require_login
  before_action :set_request_context
  after_action :verify_authorized, except: [ :index ]
  after_action :verify_policy_scoped, only: [ :index ]

  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  private

  def require_login
    redirect_to admin_login_path unless current_user
  end

  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end
  helper_method :current_user

  def recover_session_from_cookie
    return if session[:user_id]
    return unless cookies.signed[:remember_token]

    user = User.find_by(id: cookies.signed[:remember_token])
    if user
      session[:user_id] = user.id
      @current_user = user
    else
      cookies.delete(:remember_token)
    end
  end

  def set_request_context
    Current.user = current_user
    Current.request_id = request.request_id
    Current.ip = request.remote_ip
    Current.user_agent = request.user_agent
  end

  def user_not_authorized
    flash[:alert] = "没有权限执行此操作"
    redirect_back(fallback_location: admin_root_path)
  end
end
