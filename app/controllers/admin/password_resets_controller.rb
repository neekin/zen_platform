# frozen_string_literal: true

module Admin
  class PasswordResetsController < AdminController
    skip_before_action :require_login
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped
    layout "admin"

    # GET /admin/password/new
    def new
      render inertia: "admin/password/Forgot"
    end

    # POST /admin/password
    def create
      email = params[:email].to_s.strip.downcase
      user = User.find_by("LOWER(email) = ?", email)

      if user
        token = user.generate_reset_password_token!

        # TODO: 发送重置密码邮件，目前先输出到控制台
        reset_url = "#{request.base_url}/admin/password/#{token}/edit"
        Rails.logger.debug "========================================="
        Rails.logger.debug "  密码重置链接:"
        Rails.logger.debug "  #{reset_url}"
        Rails.logger.debug "  用户: #{user.email}"
        Rails.logger.debug "  有效期: 2 小时"
        Rails.logger.debug "========================================="
      end

      # 无论用户是否存在都显示成功提示（安全考虑）
      render json: { code: 0, message: "如果该邮箱已注册，重置链接已发送" }
    end

    # GET /admin/password/:token/edit
    def edit
      user = User.find_by_reset_password_token(params[:token])

      if user.nil? || user.reset_password_expired?
        redirect_to admin_login_path, alert: "重置链接无效或已过期"
        return
      end

      render inertia: "admin/password/Reset", props: {
        token: params[:token],
      }
    end

    # PATCH /admin/password/:token
    def update
      user = User.find_by_reset_password_token(params[:token])

      if user.nil? || user.reset_password_expired?
        render json: { code: 1, message: "重置链接无效或已过期" }, status: :unprocessable_entity
        return
      end

      if params[:password].blank?
        render json: { code: 1, message: "密码不能为空" }, status: :unprocessable_entity
        return
      end

      if params[:password] != params[:password_confirmation]
        render json: { code: 1, message: "两次密码输入不一致" }, status: :unprocessable_entity
        return
      end

      if user.reset_password!(params[:password])
        render json: { code: 0, message: "密码已重置，请重新登录" }
      else
        render json: { code: 1, errors: user.errors.to_hash(true) }, status: :unprocessable_entity
      end
    end
  end
end
