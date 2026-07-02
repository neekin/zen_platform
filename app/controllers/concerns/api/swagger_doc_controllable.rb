# frozen_string_literal: true

module Api
  module SwaggerDocControllable
    extend ActiveSupport::Concern

    class_methods do
      # 控制器级别：控制整个控制器是否在 Swagger 文档中显示
      def swagger_doc(enabled = true)
        @swagger_doc_enabled = enabled
      end

      def swagger_doc_enabled?
        @swagger_doc_enabled != false  # 默认启用
      end

      # 为控制器添加标签（分组）
      def swagger_tag(tag)
        @swagger_tags = Array(tag)
      end

      def swagger_tags
        @swagger_tags || []
      end

      # 端点级别：单个端点的额外配置
      def swagger_endpoint(action, config = {})
        @swagger_endpoints ||= {}
        @swagger_endpoints[action.to_sym] = config
      end

      def swagger_endpoint_config(action)
        @swagger_endpoints&.dig(action.to_sym) || {}
      end
    end
  end
end
