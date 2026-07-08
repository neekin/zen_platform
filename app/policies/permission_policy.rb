# frozen_string_literal: true

class PermissionPolicy < ApplicationPolicy
  def index? = user.has_any_role?(:super_admin, :admin)
  def update? = user.has_role?(:super_admin)
end
