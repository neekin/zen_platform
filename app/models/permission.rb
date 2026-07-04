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
end
