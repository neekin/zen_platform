# frozen_string_literal: true

module Admin
  class UsersController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    before_action :require_admin!

    # GET /admin/users
    def index
      page = (params[:page] || 1).to_i
      per_page = (params[:per_page] || 20).to_i.clamp(1, 100)
      offset = (page - 1) * per_page

      users = User.offset(offset).limit(per_page)
      total = User.count

      render inertia: "admin/users/Index",
        props: {
          users: users.map { |u|
            {
              id: u.id,
              email: u.email,
              username: u.username,
              name: u.name,
              avatar: u.avatar.attached? ? url_for(u.avatar) : nil,
              phone: u.phone,
              roles: u.roles.pluck(:name),
              created_at: u.created_at.iso8601
            }
          },
          roles: Role.all.map { |r| { name: r.name } },
          pagination: {
            page: page,
            per_page: per_page,
            total: total
          }
        }
    end

    # POST /admin/users
    def create
      user = User.new(user_params)
      if user.save
        user.roles = Role.where(name: params[:roles]) if params[:roles].present?
        redirect_to admin_users_path, notice: "创建成功"
      else
        redirect_to admin_users_path, alert: user.errors.full_messages.join(", ")
      end
    end

    # PATCH /admin/users/:id
    def update
      user = User.find(params[:id])
      attrs = user_params.to_h
      attrs.delete(:password) if attrs[:password].blank?
      attrs.delete(:password_confirmation) if attrs[:password_confirmation].blank?
      user.update!(attrs)
      user.roles = Role.where(name: params[:roles]) if params[:roles].present?
      redirect_to admin_users_path, notice: "更新成功"
    rescue ActiveRecord::RecordInvalid => e
      redirect_to admin_users_path, alert: e.message
    end

    # DELETE /admin/users/:id
    def destroy
      user = User.find(params[:id])
      if user == current_user
        redirect_to admin_users_path, alert: "不能删除自己"
      else
        user.destroy!
        redirect_to admin_users_path, notice: "删除成功"
      end
    end

    private

    def require_admin!
      unless current_user.has_any_role?(:super_admin, :admin)
        redirect_to admin_root_path, alert: "没有权限"
      end
    end

    def user_params
      params.require(:user).permit(:email, :username, :name, :password, :password_confirmation)
    end
  end
end
