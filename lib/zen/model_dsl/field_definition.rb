# frozen_string_literal: true

module Zen
  module ModelDsl
    class FieldDefinition
    attr_reader :name, :type, :options

    def initialize(name, type, options = {})
      @name = name.to_sym
      @type = type.to_sym
      @options = options
    end

    # 是否必填
    def required?
      options[:required] == true
    end

    # 字段可见性检查（支持 lambda）
    # field :price, :decimal, visible_if: ->(user) { user.has_any_role?(:admin, :finance) }
    def visible_for?(user)
      return true unless options[:visible_if]
      return true unless options[:visible_if].is_a?(Proc)

      options[:visible_if].call(user)
    rescue => e
      Rails.logger.warn("[Zen::ModelDsl] visible_if error for #{name}: #{e.message}")
      true
    end

    # 是否有可见性限制
    def has_visibility_restriction?
      options[:visible_if].is_a?(Proc)
    end

    # 字段联动条件（前端使用）
    # field :end_date, :date, visible_when: { status: "published" }
    # field :reason, :text, visible_when: { status: ["rejected", "cancelled"] }
    # field :priority, :enum, visible_when: { status: "published", type: "urgent" }
    def visible_when
      options[:visible_when]
    end

    # 是否有联动条件
    def has_visible_when?
      options[:visible_when].is_a?(Hash) && options[:visible_when].present?
    end

    # 默认值
    def default
      options[:default]
    end

    # 占位符
    def placeholder
      options[:placeholder]
    end

    # 是否为关联字段
    def reference?
      type == :reference || name.to_s.end_with?("_id")
    end

    # 关联目标模型
    def target_model
      return options[:target] if options[:target]
      return name.to_s.sub(/_id$/, "").classify.constantize if name.to_s.end_with?("_id")
      nil
    rescue NameError
      nil
    end

    # 枚举值
    def enum_values
      options[:values] || []
    end

    # 图片/文件接受类型
    def accept_types
      options[:accept] || []
    end

    # 最大大小
    def max_size
      options[:max_size]
    end

    # 最小值
    def min_value
      options[:min]
    end

    # 最大值
    def max_value
      options[:max]
    end

    # 精度（小数）
    def precision
      options[:precision]
    end

    # 标度（小数）
    def scale
      options[:scale]
    end

    # 标签建议
    def suggestions
      options[:suggestions] || []
    end

    # 是否多选
    def multiple?
      options[:multiple] == true
    end

    # 最大数量
    def max_count
      options[:max_count]
    end

    # 转换为哈希（用于 JSON 序列化）
    def to_h
      result = {
        name: name,
        type: type,
        required: required?,
        default: default,
        placeholder: placeholder,
        reference: reference?,
        target_model: target_model&.name,
        enum_values: enum_values,
        accept_types: accept_types,
        max_size: max_size,
        min_value: min_value,
        max_value: max_value,
        precision: precision,
        scale: scale,
        suggestions: suggestions,
        multiple: multiple?,
        max_count: max_count
      }.compact

      # 联动条件
      result[:visible_when] = visible_when if has_visible_when?

      result
    end

    # 获取前端组件类型
    def component_type
      case type
      when :string, :url, :email
        :text_input
      when :text
        :textarea
      when :rich_text
        :rich_text_editor
      when :integer, :decimal, :float
        :number_input
      when :boolean
        :switch
      when :date
        :date_picker
      when :datetime
        :datetime_picker
      when :enum
        :select
      when :image
        :image_upload
      when :file
        :file_upload
      when :tags
        :tag_input
      when :json
        :json_editor
      when :color
        :color_picker
      when :reference
        :reference_select
      else
        :text_input
      end
    end

    # 获取列表展示组件类型
    def list_display_type
      case type
      when :rich_text
        :text_summary
      when :image
        :thumbnail
      when :boolean
        :badge
      when :enum
        :badge
      when :tags
        :tag_list
      when :datetime
        :relative_time
      when :json
        :json_preview
      when :url, :email
        :link
      when :reference
        :reference_name
      else
        :text
      end
    end
    end
  end
end
