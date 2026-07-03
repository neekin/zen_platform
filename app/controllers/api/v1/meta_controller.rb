# frozen_string_literal: true

module Api
  module V1
    class MetaController < ApiController
      MODEL_WHITELIST = %w[Article Product Task Category User].freeze

      # GET /api/v1/meta/:model_name
      def show
        model_class = resolve_model(params[:model_name])
        return render_error(message: "模型不存在") unless model_class
        return render_error(message: "该模型不支持元数据查询") unless model_class.respond_to?(:zen_meta)

        render_success(model_class.zen_meta)
      end

      private

      def resolve_model(name)
        class_name = name.to_s.classify
        return nil unless MODEL_WHITELIST.include?(class_name)

        class_name.safe_constantize
      end
    end
  end
end
