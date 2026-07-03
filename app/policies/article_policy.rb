# frozen_string_literal: true

class ArticlePolicy < ApplicationPolicy
  def index?  = true
  def show?   = true
  def create? = user.has_any_role?(:super_admin, :admin, :editor)
  def update? = create?
  def destroy? = user.has_any_role?(:super_admin, :admin)

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user.has_any_role?(:super_admin, :admin)
        scope.all
      else
        scope.where(status: :published)
      end
    end
  end
end
