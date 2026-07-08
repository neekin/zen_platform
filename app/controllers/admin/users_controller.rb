# frozen_string_literal: true

module Admin
  class UsersController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    before_action :require_admin!

    # GET /admin/users
    def index
      result = UserResource.list(params, view_name: :admin)

      # 批量预加载关联数据，避免 N+1 查询
      user_ids = result.data.map { |h| h[:id] }
      users_by_id = User.where(id: user_ids)
        .includes(:avatar_attachment, roles: [])
        .index_by(&:id)

      users_with_extras = result.data.map do |user_hash|
        user = users_by_id[user_hash[:id]]
        user_hash.merge(
          avatar: user&.avatar&.attached? ? url_for(user.avatar) : nil,
          roles: user&.roles&.pluck(:name) || []
        )
      end

      render inertia: "admin/users/Index",
        props: result.to_inertia(
          meta: { roles: Role.all.map { |r| { name: r.name } } }
        ).merge(users: users_with_extras)
    end

    # POST /admin/users
    def create
      result = UserResource.create(user_params)
      if result.success?
        user = User.find(result.data[:id])
        user.roles = Role.where(name: params[:roles]) if params[:roles].present?
        redirect_to admin_users_path, notice: "创建成功"
      else
        redirect_to admin_users_path, alert: result.errors.to_hash(true)
      end
    end

    # PATCH /admin/users/:id
    def update
      attrs = user_params.to_h
      attrs.delete(:password) if attrs[:password].blank?
      attrs.delete(:password_confirmation) if attrs[:password_confirmation].blank?

      result = UserResource.update(params[:id], attrs)
      if result.success?
        user = User.find(params[:id])
        user.roles = Role.where(name: params[:roles]) if params[:roles].present?
        redirect_to admin_users_path, notice: "更新成功"
      else
        redirect_to admin_users_path, alert: result.errors.to_hash(true)
      end
    end

    # DELETE /admin/users/:id
    def destroy
      user = User.find(params[:id])
      if user == current_user
        redirect_to admin_users_path, alert: "不能删除自己"
      else
        UserResource.destroy(params[:id])
        redirect_to admin_users_path, notice: "删除成功"
      end
    end

    # GET /admin/users/:id/association_data
    def association_data
      result = UserResource.association_data(
        params[:id],
        params[:name].to_sym,
        params,
        view_name: :admin
      )
      if result.success?
        render json: result.to_json
      else
        render json: result.to_error_json, status: :unprocessable_entity
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
