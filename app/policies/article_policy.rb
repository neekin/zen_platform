# frozen_string_literal: true

class ArticlePolicy < ApplicationPolicy
  def index? = true
  def show? = true

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
