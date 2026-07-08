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
              users_count: r.users.count
            }
          }
        }
    end

    # POST /admin/roles
    def create
      Role.create!(name: params[:name])
      redirect_to admin_roles_path, notice: "创建成功"
    rescue ActiveRecord::RecordInvalid => e
      redirect_to admin_roles_path, alert: e.message
    end

    # DELETE /admin/roles/:id
    def destroy
      role = Role.find(params[:id])
      if %w[super_admin admin editor viewer].include?(role.name)
        redirect_to admin_roles_path, alert: "不能删除系统内置角色"
      else
        role.destroy!
        redirect_to admin_roles_path, notice: "删除成功"
      end
    end

    private

    def require_super_admin!
      unless current_user.has_role?(:super_admin)
        redirect_to admin_root_path, alert: "没有权限"
      end
    end
  end
end
