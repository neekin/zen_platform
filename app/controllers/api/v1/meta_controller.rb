# frozen_string_literal: true

module Api
  module V1
    class MetaController < ApiController
      # GET /api/v1/meta/:model_name
      # 自动检测包含 Zen::ModelDsl 的模型，无需维护白名单
      def show
        model_class = resolve_model(params[:model_name])
        return render_error(message: "模型不存在") unless model_class
        return render_error(message: "该模型不支持元数据查询") unless model_class.respond_to?(:zen_meta)

        render_success(model_class.zen_meta)
      end

      private

      def resolve_model(name)
        class_name = name.to_s.classify
        klass = class_name.safe_constantize
        return nil unless klass && klass < ApplicationRecord

        klass
      end
    end
  end
end
