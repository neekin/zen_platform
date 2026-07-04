# frozen_string_literal: true

module Zen
  module ModelDsl
    module FieldTypes
    # 字段类型映射
    TYPE_MAPPINGS = {
      # 基础类型
      string: { rails: :string, js: "string", component: "ProFormText" },
      text: { rails: :text, js: "string", component: "ProFormTextArea" },
      rich_text: { rails: :text, js: "string", component: "RichTextEditor" },
      integer: { rails: :integer, js: "number", component: "ProFormDigit" },
      decimal: { rails: :decimal, js: "number", component: "ProFormDigit" },
      float: { rails: :float, js: "number", component: "ProFormDigit" },
      boolean: { rails: :boolean, js: "boolean", component: "ProFormSwitch" },
      date: { rails: :date, js: "string", component: "ProFormDatePicker" },
      datetime: { rails: :datetime, js: "string", component: "ProFormDateTimePicker" },
      time: { rails: :time, js: "string", component: "ProFormTimePicker" },

      # 特殊类型
      enum: { rails: :string, js: "string", component: "ProFormSelect" },
      image: { rails: :string, js: "string", component: "ImageUpload" },
      file: { rails: :string, js: "string", component: "FileUpload" },
      tags: { rails: :text, js: "string[]", component: "TagInput" },
      json: { rails: :json, js: "object", component: "JsonEditor" },
      color: { rails: :string, js: "string", component: "ColorPicker" },
      url: { rails: :string, js: "string", component: "ProFormText" },
      email: { rails: :string, js: "string", component: "ProFormText" },

      # 关联类型
      reference: { rails: :integer, js: "number", component: "ReferenceSelect" },
    }.freeze

    # 获取 Rails 迁移类型
    def self.rails_type(field_type)
      TYPE_MAPPINGS.dig(field_type.to_sym, :rails) || :string
    end

    # 获取 JavaScript 类型
    def self.js_type(field_type)
      TYPE_MAPPINGS.dig(field_type.to_sym, :js) || "string"
    end

    # 获取表单组件名称
    def self.component_type(field_type)
      TYPE_MAPPINGS.dig(field_type.to_sym, :component) || "ProFormText"
    end

    # 字段类型是否支持搜索
    def self.searchable?(field_type)
      [:string, :text, :enum, :reference].include?(field_type.to_sym)
    end

    # 字段类型是否支持排序
    def self.sortable?(field_type)
      [:string, :integer, :decimal, :float, :date, :datetime, :boolean].include?(field_type.to_sym)
    end

    # 字段类型是否支持过滤
    def self.filterable?(field_type)
      [:string, :enum, :boolean, :reference, :date, :datetime].include?(field_type.to_sym)
    end

    # 获取枚举状态颜色
    def self.enum_color(value, field_def)
      return :default unless field_def.type == :enum
      
      # 默认颜色映射
      color_map = field_def.options[:colors] || {}
      color_map[value.to_sym] || :default
    end
    end
  end
end
