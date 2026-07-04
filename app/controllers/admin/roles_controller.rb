# frozen_string_literal: true

module Admin
  class RolesController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    before_action :require_super_admin!

    # GET /admin/roles
    def index
      roles = Role.all
      render inertia: "admin/roles/Index",
        props: {
          roles: roles.map { |r|
            {
              id: r.id,
              name: r.name,
              users_count: r.users.count,
            }
          },
        }
    end

    # POST /admin/roles
    def create
      Role.create!(name: params[:name])
      render json: { code: 0, message: "创建成功" }
    rescue ActiveRecord::RecordInvalid => e
      render json: { code: 1, message: e.message }, status: :unprocessable_entity
    end

    # DELETE /admin/roles/:id
    def destroy
      role = Role.find(params[:id])
      if %w[super_admin admin editor viewer].include?(role.name)
        render json: { code: 1, message: "不能删除系统内置角色" }, status: :unprocessable_entity
      else
        role.destroy!
        render json: { code: 0, message: "删除成功" }
      end
    end

    private

    def require_super_admin!
      unless current_user.has_role?(:super_admin)
        render json: { code: 1, message: "没有权限" }, status: :forbidden
      end
    end
  end
end
