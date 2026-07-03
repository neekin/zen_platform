# frozen_string_literal: true

class UserPolicy < ApplicationPolicy
  def index?  = user.has_role?(:super_admin) || user.has_role?(:admin)
  def show?   = index?
  def create? = user.has_role?(:super_admin) || user.has_role?(:admin)
  def update? = user.has_role?(:super_admin) || user.has_role?(:admin)
  def destroy? = user.has_role?(:super_admin)
end
