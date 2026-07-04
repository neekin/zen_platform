# frozen_string_literal: true

module Admin
  class PermissionsController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    before_action :require_super_admin!

    # GET /admin/permissions
    def index
      roles = Role.pluck(:name)
      resources = Permission::RESOURCES
      actions = Permission::ACTIONS

      # 加载所有权限记录
      all_permissions = Permission.all.group_by { |p| [p.role_name, p.resource, p.action_name] }

      # 构建矩阵数据
      matrix = roles.map do |role_name|
        {
          role: role_name,
          permissions: resources.map do |resource|
            valid_actions = Permission::RESOURCE_ACTIONS[resource] || actions
            {
              resource: resource,
              actions: valid_actions.map do |action_name|
                key = [role_name, resource, action_name]
                perm = all_permissions[key]&.first
                {
                  action: action_name,
                  allowed: perm ? perm.allowed : Permission::DEFAULTS.dig(role_name, resource)&.include?(action_name) || false,
                  persisted: perm.present?,
                }
              end,
            }
          end,
        }
      end

      render inertia: "admin/permissions/Index",
        props: {
          matrix: matrix,
          roles: roles,
          resources: resources,
          resource_actions: Permission::RESOURCE_ACTIONS,
          actions: actions,
        }
    end

    # PATCH /admin/permissions
    def update
      role_name = params[:role_name]
      resource = params[:resource]
      action_name = params[:action_name]
      allowed = params[:allowed]

      permission = Permission.find_or_initialize_by(
        role_name: role_name,
        resource: resource,
        action_name: action_name
      )

      if allowed.to_s == "false"
        permission.destroy
        render json: { code: 0, message: "已恢复默认权限" }
      else
        permission.update!(allowed: true)
        render json: { code: 0, message: "权限已更新" }
      end
    rescue ActiveRecord::RecordInvalid => e
      render json: { code: 1, message: e.message }, status: :unprocessable_entity
    end

    # POST /admin/permissions/reset
    def reset
      Permission.delete_all
      Permission.seed_defaults!
      render json: { code: 0, message: "已重置为默认权限" }
    end

    private

    def require_super_admin!
      unless current_user.has_role?(:super_admin)
        render json: { code: 1, message: "没有权限" }, status: :forbidden
      end
    end
  end
end
