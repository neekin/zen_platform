# frozen_string_literal: true

class ApplicationPolicy
  attr_reader :user, :record

  def initialize(user, record)
    @user = user
    @record = record
  end

  def index?  = check_permission(:index)
  def show?   = check_permission(:show)
  def create? = check_permission(:create)
  def update? = check_permission(:update)
  def destroy? = check_permission(:destroy)

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

  private

  # 检查用户是否有权限（数据库优先，回退到默认配置）
  def check_permission(action)
    resource = record.is_a?(Class) ? record.name : record.class.name
    user.roles.each do |role|
      return true if Permission.allowed?(role.name, resource, action.to_s)
    end
    false
  end
end
