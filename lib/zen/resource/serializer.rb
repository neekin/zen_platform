# frozen_string_literal: true

module Zen
  class Resource
    class Serializer
      def initialize(resource_class, view_name)
        @resource_class = resource_class
        @view_config = resource_class.view_config(view_name)
        @attributes = resource_class.resource_attributes
        @associations = resource_class.resource_associations || {}
      end

      # 序列化单个记录
      def serialize(record, context: nil)
        fields = @view_config.resolved_fields(@attributes)
        result = {}

        fields.each do |field_name|
          attr_def = @attributes[field_name]
          value = record.public_send(field_name)

          # 格式化
          options = @view_config.field_options[field_name] || {}
          value = format_value(value, attr_def, options)

          result[field_name] = value
        end

        # 序列化关联
        @view_config.association_includes.each do |assoc_config|
          assoc_name = assoc_config[:name]
          assoc_def = @associations[assoc_name]

          # 懒加载关联：belongs_to 只返回 ID，has_many 跳过（前端按需加载）
          if assoc_def&.lazy?
            if assoc_def.type == :belongs_to
              fk = "#{assoc_name}_id"
              if record.respond_to?(fk)
                result[assoc_name] = { id: record.public_send(fk), _lazy: true }
              else
                result[assoc_name] = { id: nil, _lazy: true }
              end
            end
            # has_many 懒加载：不序列化，由前端按需请求
            next if assoc_def.type == :has_many
            next if assoc_def.type == :belongs_to # 已处理
          end

          if assoc_def&.count_only?
            result[assoc_name] = record.public_send(assoc_name).count
          elsif assoc_def
            associated = record.public_send(assoc_name)
            display_field = assoc_def.display_field
            result[assoc_name] = associated.respond_to?(display_field) ? associated.public_send(display_field) : associated.to_s
          end
        end

        result
      end

      # 序列化集合
      def serialize_collection(records, context: nil)
        records.map { |r| serialize(r, context: context) }
      end

      private

      def format_value(value, attr_def, options)
        return nil if value.nil?

        format = options[:format]
        case format
        when :iso8601
          value.respond_to?(:iso8601) ? value.iso8601 : value.to_s
        when :relative_time
          value.to_s # 前端处理
        else
          value
        end
      end
    end
  end
end
