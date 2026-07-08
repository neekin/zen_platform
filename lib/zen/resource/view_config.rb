# frozen_string_literal: true

module Zen
  class Resource
    class ViewConfig
      attr_reader :included_fields, :excluded_fields, :field_options, :association_includes

      def initialize
        @included_fields = []
        @excluded_fields = []
        @field_options = {}
        @association_includes = []
      end

      def include(*fields)
        options = fields.last.is_a?(Hash) ? fields.pop : {}
        fields.each do |f|
          @included_fields << f.to_sym
          @field_options[f.to_sym] = options if options.any?
        end
      end

      def exclude(*fields)
        @excluded_fields.concat(fields.map(&:to_sym))
      end

      # include_association :role, format: :name_only
      def include_association(name, **options)
        @association_includes << { name: name.to_sym }.merge(options)
      end

      # 字段级选项
      def field(name, **options)
        @field_options[name.to_sym] = options
      end

      # 计算最终字段列表
      def resolved_fields(all_attributes)
        fields = if @included_fields.any?
          all_attributes.keys.select { |k| @included_fields.include?(k) }
        else
          all_attributes.keys
        end

        fields.reject { |k| @excluded_fields.include?(k) }
      end
    end
  end
end
