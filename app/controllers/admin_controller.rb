# frozen_string_literal: true

class AdminController < InertiaController
  layout "admin"

  before_action :recover_session_from_cookie

  # 自动从顶层命名空间查找模型类
  # 例如在 Admin::ArticlesController 中可以直接使用 Article 而不需要 ::Article
  def self.const_missing(name)
    if name.to_s.classify.safe_constantize
      name.to_s.classify.constantize
    else
      super
    end
  end

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
end
