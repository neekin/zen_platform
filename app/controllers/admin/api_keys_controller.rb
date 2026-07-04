# frozen_string_literal: true

module Admin
  class ApiKeysController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    before_action :require_admin!

    # GET /admin/api_keys
    def index
      page = (params[:page] || 1).to_i
      per_page = (params[:per_page] || 20).to_i.clamp(1, 100)
      offset = (page - 1) * per_page

      api_keys = ApiKey.includes(:user).offset(offset).limit(per_page).order(created_at: :desc)
      total = ApiKey.count

      render inertia: "admin/api_keys/Index",
        props: {
          api_keys: api_keys.map { |k|
            {
              id: k.id,
              name: k.name,
              key_masked: mask_key(k.key),
              key: k.key,
              user_id: k.user_id,
              user_name: k.user&.name || k.user&.username || k.user&.email,
              expires_at: k.expires_at&.iso8601,
              expired: k.expired?,
              created_at: k.created_at.iso8601,
            }
          },
          users: User.all.map { |u| { id: u.id, label: u.name || u.username || u.email } },
          pagination: {
            page: page,
            per_page: per_page,
            total: total,
          },
        }
    end

    # POST /admin/api_keys
    def create
      api_key = ApiKey.new(api_key_params)
      if api_key.save
        render json: { code: 0, message: "创建成功", data: { key: api_key.key } }
      else
        render json: { code: 1, message: api_key.errors.full_messages.join(", ") }, status: :unprocessable_entity
      end
    end

    # DELETE /admin/api_keys/:id
    def destroy
      api_key = ApiKey.find(params[:id])
      api_key.destroy!
      render json: { code: 0, message: "删除成功" }
    end

    private

    def require_admin!
      unless current_user.has_any_role?(:super_admin, :admin)
        render json: { code: 1, message: "没有权限" }, status: :forbidden
      end
    end

    def api_key_params
      params.require(:api_key).permit(:name, :user_id, :expires_at)
    end

    def mask_key(key)
      return "" if key.blank?
      "#{key[0..7]}...#{key[-4..]}"
    end
  end
end
