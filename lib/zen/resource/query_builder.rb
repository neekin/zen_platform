# frozen_string_literal: true

module Zen
  class Resource
    class QueryBuilder
      def initialize(resource_class)
        @resource_class = resource_class
        @model = resource_class.model_class
        @pagination = resource_class.pagination_config
        @sortable_fields = resource_class.sortable_fields || []
        @searchable_fields = resource_class.searchable_fields
      end

      # 构建查询
      # @param params [Hash] 请求参数
      # @param scope [ActiveRecord::Relation] 基础查询范围
      # @param includes [Array<Symbol>] 额外 eager load 关联
      # @return [Hash] { records:, meta: }
      def build(params = {}, scope: nil, includes: nil)
        query = scope || @model.all

        # 0. Eager load（合并 Resource 默认 + 调用方传入）
        all_includes = (@resource_class.default_includes || []) + (includes || [])
        query = query.includes(*all_includes) if all_includes.any?

        # 1. 搜索
        query = apply_search(query, params[:search]) if params[:search].present?

        # 2. 过滤
        query = apply_filters(query, params[:filter]) if params[:filter].present?

        # 3. 排序
        query = apply_sort(query, params[:sort], params[:sort_dir])

        # 4. 分页
        result = apply_pagination(query, params)

        {
          records: result[:records],
          meta: result[:meta]
        }
      end

      private

      # 全文搜索
      def apply_search(query, search_term)
        return query if @searchable_fields.empty?

        conditions = @searchable_fields.map { |f| "#{f} LIKE :search" }.join(" OR ")
        query.where(conditions, search: "%#{search_term}%")
      end

      # 字段过滤
      def apply_filters(query, filters)
        return query unless filters.is_a?(Hash)

        filters.each do |field, value|
          next if value.blank?

          if @model.column_names.include?(field.to_s)
            query = query.where(field => value)
          end
        end

        query
      end

      # 排序
      def apply_sort(query, sort_field, sort_dir = "asc")
        return query if sort_field.blank?
        return query unless @sortable_fields.include?(sort_field.to_sym)

        direction = %w[asc desc].include?(sort_dir.to_s.downcase) ? sort_dir.to_s.downcase : "asc"
        query.order("#{sort_field} #{direction}")
      end

      # 分页（支持游标分页和偏移分页）
      def apply_pagination(query, params)
        return { records: query.to_a, meta: {} } unless @pagination

        per_page = (params[:per_page] || @pagination[:per_page]).to_i
        per_page = [per_page, @pagination[:max_per_page]].min

        # 游标分页模式（cursor key 存在且非空字符串即启用，nil 表示第一页）
        if params.key?(:cursor) && params[:cursor] != ""
          apply_cursor_pagination(query, params, per_page)
        else
          apply_offset_pagination(query, params, per_page)
        end
      end

      # 偏移分页（传统模式）
      def apply_offset_pagination(query, params, per_page)
        page = (params[:page] || 1).to_i
        total = query.count
        records = query.offset((page - 1) * per_page).limit(per_page)

        {
          records: records.to_a,
          meta: {
            page: page,
            per_page: per_page,
            total: total,
            total_pages: (total.to_f / per_page).ceil,
            pagination_type: 'offset'
          }
        }
      end

      # 游标分页（虚拟滚动模式）
      def apply_cursor_pagination(query, params, per_page)
        cursor = params[:cursor]
        direction = params[:cursor_direction] || 'after'
        sort_field = params[:sort] || 'id'
        sort_dir = params[:sort_dir] || 'asc'

        # 确保排序字段有效
        sort_field = 'id' unless @sortable_fields.include?(sort_field.to_sym) || sort_field == 'id'

        # 应用游标条件
        if cursor.present?
          operator = direction == 'after' ? '>' : '<'
          query = query.where("#{sort_field} #{operator} ?", cursor)
        end

        # 排序
        query = query.order("#{sort_field} #{sort_dir}")

        # 多取一条判断是否有更多数据
        records = query.limit(per_page + 1).to_a
        has_more = records.size > per_page
        records = records.first(per_page)

        # 获取下一页游标
        next_cursor = has_more ? records.last&.send(sort_field) : nil

        {
          records: records,
          meta: {
            per_page: per_page,
            has_more: has_more,
            next_cursor: next_cursor,
            pagination_type: 'cursor'
          }
        }
      end
    end
  end
end
