# frozen_string_literal: true

module Admin
  class ProfileController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    # GET /admin/profile
    def show
      render inertia: "admin/profile/Show", props: {
        user: current_user.as_json(only: %i[id username email name phone note created_at]),
      }
    end

    # PATCH /admin/profile
    def update
      if current_user.update(profile_params)
        render json: { code: 0, message: "个人信息已更新" }
      else
        render json: { code: 1, message: current_user.errors.full_messages.join(", ") }, status: :unprocessable_entity
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
        render json: { code: 1, message: current_user.errors.full_messages.join(", ") }, status: :unprocessable_entity
      end
    end

    private

    def profile_params
      params.permit(:name, :phone, :note)
    end
  end
end
