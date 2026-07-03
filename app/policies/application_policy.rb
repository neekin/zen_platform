# frozen_string_literal: true

class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?  = user.has_any_role?(:super_admin, :admin, :editor, :viewer)
  def show?   = index?
  def create? = user.has_any_role?(:super_admin, :admin, :editor)
  def update? = create?
  def destroy? = user.has_any_role?(:super_admin, :admin)

  class Scope
    attr_reader :user, :scope

    def initialize(user, scope)
      @user = user
      @scope = scope
    end

    def resolve
      scope.all
    end
  end
end
