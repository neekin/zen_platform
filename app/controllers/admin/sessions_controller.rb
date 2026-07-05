# frozen_string_literal: true

module Admin
  class SessionsController < AdminController
    skip_before_action :require_login, only: [ :new, :create, :send_login_code ]
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped
    layout "admin"

    def new
      if current_user
        redirect_to admin_root_path
        return
      end
      render inertia: "admin/Login"
    end

    def create
      user = if params[:login_type] == "phone"
               phone_login
             else
               password_login
             end

      if user
        session[:user_id] = user.id
        cookies.signed.permanent[:remember_token] = user.id if params[:auto_login].to_s == "true"
        redirect_to admin_root_path, notice: "登录成功"
      else
        redirect_to admin_login_path, alert: @login_error || "登录失败"
      end
    end

    # POST /admin/send_login_code
    # 发送登录验证码
    def send_login_code
      phone = params[:phone].to_s.strip

      if phone.blank?
        render json: { code: 1, message: "请输入手机号码" }
        return
      end

      user = User.find_by(phone: phone)
      unless user
        render json: { code: 1, message: "该手机号码未注册" }
        return
      end

      VerificationCodeService.generate(user, "login")
      render json: { code: 0, message: "验证码已发送" }
    end

    def destroy
      session.delete(:user_id)
      cookies.delete(:remember_token)
      redirect_to admin_login_path, notice: "已退出登录"
    end

    private

    def password_login
      user = User.find_by_account(params[:account])

      if user&.authenticate(params[:password])
        user
      else
        @login_error = "账号或密码错误"
        nil
      end
    end

    def phone_login
      phone = params[:phone].to_s.strip
      code = params[:verification_code].to_s.strip

      user = User.find_by(phone: phone)
      unless user
        @login_error = "该手机号码未注册"
        return nil
      end

      unless VerificationCodeService.verify?(user, "login", code)
        @login_error = "验证码不正确或已过期"
        return nil
      end

      user
    end
  end
end
