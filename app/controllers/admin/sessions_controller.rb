# frozen_string_literal: true

module Admin
  class SessionsController < AdminController
    layout "admin"

    def new
      redirect_to admin_root_path if session[:user_id]

      render inertia: "admin/Login"
    end

    def create
      user = User.find_by_account(params[:account])

      if user&.authenticate(params[:password])
        session[:user_id] = user.id
        redirect_to admin_root_path, notice: "登录成功"
      else
        redirect_to admin_login_path, alert: "账号或密码错误"
      end
    end

    def destroy
      session.delete(:user_id)
      redirect_to admin_login_path, notice: "已退出登录"
    end
  end
end
