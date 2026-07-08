# frozen_string_literal: true

module Admin
  class ProfileController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    # GET /admin/profile
    def show
      render inertia: "admin/profile/Show", props: {
        user: current_user.as_json(only: %i[id username email name phone note created_at]).merge(
          "avatar" => current_user.avatar.attached? ? url_for(current_user.avatar) : nil
        ),
      }
    end

    # PATCH /admin/profile
    def update
      if current_user.update(profile_params)
        render json: { code: 0, message: "个人信息已更新" }
      else
        render json: { code: 1, errors: current_user.errors.to_hash(true) }, status: :unprocessable_entity
      end
    end

    # PATCH /admin/profile/password
    def update_password
      unless current_user.authenticate(params[:current_password])
        render json: { code: 1, message: "当前密码不正确" }, status: :unprocessable_entity
        return
      end

      if params[:password].blank?
        render json: { code: 1, message: "新密码不能为空" }, status: :unprocessable_entity
        return
      end

      if current_user.update(password: params[:password])
        render json: { code: 0, message: "密码已更新" }
      else
        render json: { code: 1, errors: current_user.errors.to_hash(true) }, status: :unprocessable_entity
      end
    end

    # POST /admin/profile/send_code
    # 发送验证码（控制台输出）
    def send_code
      purpose = params[:purpose] || "bind_phone"
      code = VerificationCodeService.generate(current_user, purpose)
      render json: { code: 0, message: "验证码已发送" }
    end

    # PATCH /admin/profile/bind_phone
    # 绑定手机号码（需要验证码）
    def bind_phone
      phone = params[:phone].to_s.strip
      verification_code = params[:verification_code].to_s.strip

      if phone.blank?
        render json: { code: 1, message: "手机号码不能为空" }, status: :unprocessable_entity
        return
      end

      unless phone.match?(/\A1[3-9]\d{9}\z/)
        render json: { code: 1, message: "手机号码格式不正确" }, status: :unprocessable_entity
        return
      end

      unless VerificationCodeService.verify?(current_user, "bind_phone", verification_code)
        render json: { code: 1, message: "验证码不正确或已过期" }, status: :unprocessable_entity
        return
      end

      if current_user.update(phone: phone)
        render json: { code: 0, message: "手机号码已绑定" }
      else
        render json: { code: 1, errors: current_user.errors.to_hash(true) }, status: :unprocessable_entity
      end
    end

    # PATCH /admin/profile/avatar
    def update_avatar
      if params[:avatar].blank?
        render json: { code: 1, message: "请选择头像" }, status: :unprocessable_entity
        return
      end

      current_user.avatar.attach(params[:avatar])
      render json: { code: 0, message: "头像已更新", url: url_for(current_user.avatar) }
    end

    # PATCH /admin/profile/locale
    def update_locale
      locale = params[:locale].to_s.strip
      unless %w[zh-CN en].include?(locale)
        render json: { code: 1, message: "不支持的语言" }, status: :unprocessable_entity
        return
      end

      if current_user.update(locale: locale)
        render json: { code: 0, message: "语言已更新" }
      else
        render json: { code: 1, errors: current_user.errors.to_hash(true) }, status: :unprocessable_entity
      end
    end

    private

    def profile_params
      params.permit(:name, :note)
    end
  end
end
