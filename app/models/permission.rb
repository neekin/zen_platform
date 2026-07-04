# frozen_string_literal: true

class Permission < ApplicationRecord
  validates :role_name, presence: true
  validates :resource, presence: true
  validates :action_name, presence: true
  validates :role_name, uniqueness: { scope: [:resource, :action_name] }

  # 默认权限配置（与 Policy 代码一致）
  DEFAULTS = {
    "super_admin" => {
      "User" => %w[index show create update destroy],
      "Role" => %w[index create destroy],
      "AuditLog" => %w[index show restore],
      "Notification" => %w[index mark_as_read mark_all_as_read],
      "Export" => %w[create show],
    },
    "admin" => {
      "User" => %w[index show update],
      "Role" => %w[index],
      "AuditLog" => %w[index show restore],
      "Notification" => %w[index mark_as_read mark_all_as_read],
      "Export" => %w[create show],
    },
    "editor" => {
      "User" => %w[],
      "Role" => %w[],
      "AuditLog" => %w[index show],
      "Notification" => %w[index mark_as_read mark_all_as_read],
      "Export" => %w[create show],
    },
    "viewer" => {
      "User" => %w[],
      "Role" => %w[],
      "AuditLog" => %w[index show],
      "Notification" => %w[index],
      "Export" => %w[show],
    },
  }.freeze

  # 获取所有资源和操作
  RESOURCES = %w[User Role AuditLog Notification Export].freeze
  ACTIONS = %w[index show create update destroy].freeze

  # 每个资源支持的操作（不支持的不显示）
  RESOURCE_ACTIONS = {
    "User"         => %w[index show create update destroy],
    "Role"         => %w[index create destroy],
    "AuditLog"     => %w[index show restore],
    "Notification" => %w[index mark_as_read mark_all_as_read],
    "Export"       => %w[create show],
    "Article"      => %w[index show create update destroy],
    "Task"         => %w[index show create update destroy],
    "Product"      => %w[index show create update destroy],
  }.freeze

  # 检查角色是否有权限
  def self.allowed?(role_name, resource, action_name)
    perm = find_by(role_name: role_name, resource: resource, action_name: action_name)
    return perm.allowed if perm

    # 回退到默认配置
    DEFAULTS.dig(role_name, resource)&.include?(action_name) || false
  end

  # 初始化默认权限（首次运行）
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
end
