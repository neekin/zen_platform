# frozen_string_literal: true

class Permission < ApplicationRecord
  validates :role_name, presence: true
  validates :resource, presence: true
  validates :action_name, presence: true
  validates :role_name, uniqueness: { scope: [ :resource, :action_name ] }

  # 每个资源支持的操作（不支持的不显示）
  # 脚手架生成器会自动在此注入新资源
  RESOURCE_ACTIONS = {
    "User"         => %w[index show create update destroy],
    "Role"         => %w[index create destroy],
    "AuditLog"     => %w[index show restore],
    "Notification" => %w[index mark_as_read mark_all_as_read],
    "Export"       => %w[create show]
  }.freeze

  # 从 RESOURCE_ACTIONS 动态派生
  RESOURCES = RESOURCE_ACTIONS.keys.freeze
  ACTIONS = %w[index show create update destroy].freeze

  # 默认权限配置（与 Policy 代码一致）
  # super_admin 不在此表中 — 通过 allowed? 的 bypass 机制拥有所有权限
  # 脚手架生成器会自动在此注入新资源的默认权限
  DEFAULTS = {
    "admin" => {
      "User" => %w[index show update],
      "Role" => %w[index],
      "AuditLog" => %w[index show restore],
      "Notification" => %w[index mark_as_read mark_all_as_read],
      "Export" => %w[create show]
    },
    "editor" => {
      "User" => %w[],
      "Role" => %w[],
      "AuditLog" => %w[index show],
      "Notification" => %w[index mark_as_read mark_all_as_read],
      "Export" => %w[create show]
    },
    "viewer" => {
      "User" => %w[],
      "Role" => %w[],
      "AuditLog" => %w[index show],
      "Notification" => %w[index],
      "Export" => %w[show]
    }
  }.freeze

  # 检查角色是否有权限
  def self.allowed?(role_name, resource, action_name)
    # super_admin 拥有所有权限
    return true if role_name == "super_admin"

    perm = find_by(role_name: role_name, resource: resource, action_name: action_name)
    return perm.allowed if perm

    # 回退到默认配置
    DEFAULTS.dig(role_name, resource)&.include?(action_name) || false
  end

  # 初始化默认权限（只创建不存在的记录，不删除已有数据）
  def self.seed_defaults!
    DEFAULTS.each do |role_name, resources|
      resources.each do |resource, actions|
        actions.each do |action_name|
          find_or_create_by(
            role_name: role_name,
            resource: resource,
            action_name: action_name
          ) do |p|
            p.allowed = true
          end
        end
      end
    end
  end

  # 重置为默认权限（删除全部后重建，会清除自定义配置）
  def self.reset_defaults!
    delete_all
    seed_defaults!
  end

  # ==================== 字段级权限 ====================

  # 检查角色是否有字段权限
  # @param role_name [String] 角色名称
  # @param resource [String] 资源名称
  # @param field_name [String] 字段名称
  # @param field_action [Symbol] :view | :edit
  # @return [Boolean]
  def self.field_allowed?(role_name, resource, field_name, field_action = :view)
    return true if role_name == "super_admin"

    perm = find_by(role_name: role_name, resource: resource, field_name: field_name)
    return perm.field_action.to_s == field_action.to_s if perm&.field_action

    # 回退到 Model DSL 默认配置
    model = resource.safe_constantize
    return true unless model&.respond_to?(:zen_field_permissions)

    defaults = model.zen_field_permissions[field_name.to_sym]
    return true unless defaults

    allowed = defaults[role_name.to_sym]
    return false if allowed == :deny
    return true if allowed == :edit
    return true if allowed == :view && field_action == :view

    false
  end

  # 获取角色在某资源上可见的字段
  def self.visible_fields(role_name, resource)
    model = resource.safe_constantize
    return [] unless model&.respond_to?(:zen_fields)

    all_fields = model.zen_fields.keys
    all_fields.select { |f| field_allowed?(role_name, resource, f, :view) }
  end

  # 获取角色在某资源上可编辑的字段
  def self.editable_fields(role_name, resource)
    model = resource.safe_constantize
    return [] unless model&.respond_to?(:zen_fields)

    all_fields = model.zen_fields.keys
    all_fields.select { |f| field_allowed?(role_name, resource, f, :edit) }
  end

  # 获取字段权限矩阵（用于前端配置 UI）
  def self.field_matrix(resource)
    roles = Role.where.not(name: "super_admin").pluck(:name)
    model = resource.safe_constantize
    return { roles: [], fields: [], matrix: [] } unless model&.respond_to?(:zen_fields)

    fields = model.zen_fields.keys

    matrix = roles.map do |role|
      {
        role: role,
        fields: fields.map do |field|
          perm = find_by(role_name: role, resource: resource, field_name: field)
          {
            field: field,
            action: perm&.field_action || "edit",
            persisted: perm&.field_action.present?,
          }
        end,
      }
    end

    { roles: roles, fields: fields, matrix: matrix }
  end

  # 更新字段权限
  def self.update_field_permission(role_name, resource, field_name, action)
    return false if role_name == "super_admin"

    perm = find_or_initialize_by(
      role_name: role_name,
      resource: resource,
      field_name: field_name
    )

    if action == "edit"
      # 默认就是 edit，删除记录即可
      perm.destroy if perm.persisted?
    else
      perm.field_action = action
      perm.save!
    end

    true
  end
end
