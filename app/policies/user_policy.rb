# frozen_string_literal: true

class UserPolicy < ApplicationPolicy
  def index? = check_permission(:index)
  def show? = check_permission(:show)
  def create? = check_permission(:create)
  def update? = check_permission(:update)
  def destroy? = check_permission(:destroy)
end
