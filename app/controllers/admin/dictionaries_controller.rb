# frozen_string_literal: true

module Admin
  class DictionariesController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped

    before_action :require_admin!

    # GET /admin/dictionaries
    def index
      result = DictionaryResource.list(params, view_name: :admin)
      serialized = result.data
      meta = result.meta

      render inertia: "admin/dictionaries/Index",
        props: {
          dictionaries: serialized,
          pagination: {
            page: meta[:page] || 1,
            per_page: meta[:per_page] || 50,
            total: meta[:total] || 0
          },
          locales: available_locales,
          groups: Dictionary.distinct.pluck(:group).compact
        }
    end

    # POST /admin/dictionaries
    def create
      result = DictionaryResource.create(dictionary_params)
      if result.success?
        clear_cache
        redirect_to admin_dictionaries_path, notice: "创建成功"
      else
        redirect_to admin_dictionaries_path, alert: result.errors.to_hash(true)
      end
    end

    # PATCH /admin/dictionaries/:id
    def update
      result = DictionaryResource.update(params[:id], dictionary_params)
      if result.success?
        clear_cache
        redirect_to admin_dictionaries_path, notice: "更新成功"
      else
        redirect_to admin_dictionaries_path, alert: result.errors.to_hash(true)
      end
    end

    # DELETE /admin/dictionaries/:id
    def destroy
      DictionaryResource.destroy(params[:id])
      clear_cache
      redirect_to admin_dictionaries_path, notice: "删除成功"
    end

    # GET /admin/dictionaries/translations/:locale
    # 获取合并后的翻译数据（静态文件 + 数据库）
    def translations
      locale = params[:locale]
      translations = TranslationService.merged_translations(locale)
      render json: translations
    end

    private

    def require_admin!
      unless current_user.has_any_role?(:super_admin, :admin)
        redirect_to admin_root_path, alert: "没有权限"
      end
    end

    def dictionary_params
      params.require(:dictionary).permit(:key, :group, translations: {})
    end

    def clear_cache
      TranslationService.clear_cache!
    end

    def available_locales
      # 从 translations 字段中提取所有语言
      Dictionary.pluck(:translations).flat_map(&:keys).uniq.sort
    end
  end
end
