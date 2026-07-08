# frozen_string_literal: true

class RolePolicy < ApplicationPolicy
  def index?  = user.has_any_role?(:super_admin, :admin)
  def create? = user.has_any_role?(:super_admin)
  def destroy? = user.has_any_role?(:super_admin)
end
