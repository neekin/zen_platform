# frozen_string_literal: true

class CategoryPolicy < ApplicationPolicy
  def index?  = true
  def show?   = true
  def create? = user.has_role?(:super_admin) || user.has_role?(:admin) || user.has_role?(:editor)
  def update? = create?
  def destroy? = user.has_role?(:super_admin) || user.has_role?(:admin)
end
