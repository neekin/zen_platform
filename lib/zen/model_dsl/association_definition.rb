# frozen_string_literal: true

module Zen
  module ModelDsl
    class AssociationDefinition
    attr_reader :name, :type, :options

    def initialize(name, type, options = {})
      @name = name.to_sym
      @type = type.to_sym
      @options = options
    end

    # 是否为 belongs_to 关联
    def belongs_to?
      type == :belongs_to
    end

    # 是否为 has_many 关联
    def has_many?
      type == :has_many
    end

    # 是否为 has_many through 关联
    def has_many_through?
      type == :has_many_through
    end

    # 获取外键名称
    def foreign_key
      return options[:foreign_key].to_s if options[:foreign_key]
      "#{name}_id"
    end

    # 获取目标模型类名
    def target_class_name
      return options[:class_name].to_s if options[:class_name]
      name.to_s.classify
    end

    # 获取目标模型类
    def target_class
      target_class_name.constantize
    rescue NameError
      nil
    end

    # 获取 through 关联名称（仅用于 has_many_through）
    def through
      options[:through]&.to_sym
    end

    # 获取显示字段（用于下拉选择）
    def display_field
      options[:display] || :name
    end

    # 是否支持搜索
    def searchable?
      options[:searchable] != false
    end

    # 是否支持创建
    def creatable?
      options[:creatable] == true
    end

    # 获取排序字段
    def order
      options[:order]
    end

    # 获取条件
    def conditions
      options[:conditions]
    end

    # 转换为哈希
    def to_h
      {
        name: name,
        type: type,
        foreign_key: foreign_key,
        target_class_name: target_class_name,
        display_field: display_field,
        searchable: searchable?,
        creatable: creatable?,
        through: through,
        order: order,
        conditions: conditions
      }.compact
    end
    end
  end
end
