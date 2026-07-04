# frozen_string_literal: true

class AuditLogPolicy < ApplicationPolicy
  def index?
    user.has_any_role?(:super_admin, :admin, :editor)
  end

  def show?
    index?
  end

  def restore?
    user.has_any_role?(:super_admin, :admin)
  end
end
