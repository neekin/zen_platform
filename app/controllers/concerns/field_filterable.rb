# frozen_string_literal: true

# 字段级权限过滤 Concern
# 在 Controller 中根据用户角色过滤字段
module FieldFilterable
  extend ActiveSupport::Concern

  private

  # 过滤记录的字段（基于当前用户角色）
  # @param resource_name [String] 资源名称（如 "User"）
  # @param records [Array<Hash>] 记录数组
  # @return [Array<Hash>] 过滤后的记录
  def filter_fields_by_permission(resource_name, records)
    return records unless current_user

    roles = current_user.roles.pluck(:name)
    role = roles.first || "viewer"
    visible = Permission.visible_fields(role, resource_name)

    return records if visible.empty?

    if records.is_a?(Array)
      records.map { |r| r.is_a?(Hash) ? r.slice(*visible.map(&:to_s)) : r }
    else
      records.as_json(only: visible)
    end
  end

  # 获取可编辑字段列表（传给前端）
  # @param resource_name [String] 资源名称
  # @return [Array<Symbol>] 可编辑字段名
  def editable_fields_for(resource_name)
    return [] unless current_user

    roles = current_user.roles.pluck(:name)
    role = roles.first || "viewer"
    Permission.editable_fields(role, resource_name)
  end

  # 获取字段权限矩阵（用于前端）
  # @param resource_name [String] 资源名称
  # @return [Array<Hash>] 字段权限数组
  def field_permissions_for(resource_name)
    return [] unless current_user

    roles = current_user.roles.pluck(:name)
    role = roles.first || "viewer"
    model = resource_name.safe_constantize
    return [] unless model&.respond_to?(:zen_fields)

    model.zen_fields.keys.map do |field|
      {
        field: field.to_s,
        action: field_permission_action(role, resource_name, field),
      }
    end
  end

  def field_permission_action(role_name, resource, field_name)
    return "edit" if role_name == "super_admin"

    perm = Permission.find_by(role_name: role_name, resource: resource, field_name: field_name.to_s)
    return perm.field_action if perm&.field_action

    # 回退到 Model DSL 默认配置
    model = resource.safe_constantize
    return "edit" unless model&.respond_to?(:zen_field_permissions)

    defaults = model.zen_field_permissions[field_name.to_sym]
    return "edit" unless defaults

    allowed = defaults[role_name.to_sym]
    return "deny" if allowed == :deny
    return "view" if allowed == :view
    "edit"
  end
end
