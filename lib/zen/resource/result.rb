# frozen_string_literal: true

module Zen
  class Resource
    class Result
      PAGINATION_KEYS = %i[page per_page total total_pages pagination_type].freeze

      attr_reader :data, :meta, :errors

      def initialize(data: nil, meta: {}, errors: nil, success: true)
        @data = data
        @meta = meta
        @errors = errors
        @success = success
      end

      def success?
        @success
      end

      def failure?
        !@success
      end

      # 转为 Inertia props 格式
      # 将分页相关字段包装到 pagination key 下，匹配前端期望的格式
      def to_inertia(meta: {})
        pagination = @meta.slice(*PAGINATION_KEYS).presence
        rest = @meta.except(*PAGINATION_KEYS)

        result = { data: @data }.merge(rest)
        result[:pagination] = pagination if pagination
        result.merge(meta)
      end

      # 转为 API JSON 格式
      def to_json
        { code: 0, message: "成功", data: @data, meta: @meta }.compact
      end

      # 失败时的 JSON
      def to_error_json(message: "请求失败")
        { code: 1, message: message, errors: @errors }
      end
    end
  end
end
