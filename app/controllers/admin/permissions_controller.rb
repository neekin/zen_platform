# frozen_string_literal: true

module Admin
  class PermissionsController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    before_action :require_super_admin!

    # GET /admin/permissions
    def index
      # super_admin 不参与权限管理（bypass 机制自动拥有所有权限）
      roles = Role.where.not(name: "super_admin").pluck(:name)

      # 动态发现资源：RESOURCE_ACTIONS 中的 + 数据库中有 Permission 记录的
      db_resources = Permission.distinct.pluck(:resource)
      resources = (Permission::RESOURCE_ACTIONS.keys + db_resources).uniq

      actions = Permission::ACTIONS

      # 加载所有权限记录
      all_permissions = Permission.all.group_by { |p| [ p.role_name, p.resource, p.action_name ] }

      # 构建矩阵数据
      matrix = roles.map do |role_name|
        {
          role: role_name,
          permissions: resources.map do |resource|
            valid_actions = Permission::RESOURCE_ACTIONS[resource] || actions
            {
              resource: resource,
              actions: valid_actions.map do |action_name|
                key = [ role_name, resource, action_name ]
                perm = all_permissions[key]&.first
                {
                  action: action_name,
                  allowed: perm ? perm.allowed : Permission::DEFAULTS.dig(role_name, resource)&.include?(action_name) || false,
                  persisted: perm.present?
                }
              end
            }
          end
        }
      end

      render inertia: "admin/permissions/Index",
        props: {
          matrix: matrix,
          roles: roles,
          resources: resources,
          resource_actions: Permission::RESOURCE_ACTIONS,
          actions: actions
        }
    end

    # PATCH /admin/permissions
    def update
      role_name = params[:role_name]

      # super_admin 权限不可修改
      if role_name == "super_admin"
        redirect_to admin_permissions_path, alert: "超级管理员无需配置权限"
        return
      end

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
        redirect_to admin_permissions_path, notice: "已恢复默认权限"
      else
        permission.update!(allowed: true)
        redirect_to admin_permissions_path, notice: "权限已更新"
      end
    rescue ActiveRecord::RecordInvalid => e
      redirect_to admin_permissions_path, alert: e.message
    end

    # POST /admin/permissions/reset
    def reset
      Permission.reset_defaults!
      redirect_to admin_permissions_path, notice: "已重置为默认权限"
    end

    # GET /admin/permissions/field_matrix?resource=User
    def field_matrix
      resource = params[:resource]
      data = Permission.field_matrix(resource)
      render json: { code: 0, data: data }
    end

    # PATCH /admin/permissions/field
    def update_field
      role_name = params[:role_name]
      resource = params[:resource]
      field_name = params[:field_name]
      action = params[:action]

      if role_name == "super_admin"
        return render json: { code: 1, message: "超级管理员无需配置权限" }, status: :forbidden
      end

      if Permission.update_field_permission(role_name, resource, field_name, action)
        render json: { code: 0, message: "字段权限已更新" }
      else
        render json: { code: 1, message: "更新失败" }, status: :unprocessable_entity
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
