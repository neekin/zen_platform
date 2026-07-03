# frozen_string_literal: true

require "active_support"
require "active_support/concern"
require "active_support/core_ext/string"

# Zen Model DSL
# 声明式定义模型字段、关联、展示方式
#
# 用法:
#   class Article < ApplicationRecord
#     include Zen::ModelDsl
#
#     field :title, :string, required: true
#     field :body, :rich_text
#     field :status, :enum, values: %w[draft published]
#
#     belongs_to :category
#     has_many :comments
#     has_many :tags, through: :article_tags
#
#     display do
#       list { column :title, link: true }
#       form { section "内容" { field :body, as: :rich_text } }
#     end
#   end

module Zen
  module ModelDsl
    extend ActiveSupport::Concern

    included do
      class_attribute :zen_fields, default: {}
      class_attribute :zen_associations, default: {}
      class_attribute :zen_display_config, default: {}
      class_attribute :zen_product_configs, default: []
    end

    class_methods do
      # 定义字段
      #
      # field :title, :string, required: true, placeholder: "请输入标题"
      # field :status, :enum, values: %w[draft published], default: "draft"
      # field :cover, :image, accept: %w[image/jpeg image/png]
      # field :category_id, :reference, target: Category
      def field(name, type, **options)
        self.zen_fields = zen_fields.merge(name.to_sym => Zen::FieldDefinition.new(name, type, options))
      end

      # 定义 belongs_to 关联
      #
      # belongs_to :category
      # belongs_to :user, display: :name, searchable: true
      def belongs_to(name, **options)
        # 保存 DSL 配置
        assoc = Zen::AssociationDefinition.new(name, :belongs_to, options.except(:optional, :foreign_key, :class_name))
        self.zen_associations = zen_associations.merge(name.to_sym => assoc)

        # 调用 ActiveRecord 的 belongs_to 创建实际关联
        super(name, **options)
      end

      # 定义 has_many 关联
      #
      # has_many :comments
      # has_many :comments, dependent: :destroy
      def has_many(name, *args, **options)
        # 保存 DSL 配置（仅对 DSL 声明的关联）
        if options.key?(:dependent) || options.key?(:class_name) || args.empty?
          assoc = Zen::AssociationDefinition.new(name, :has_many, options.except(:dependent, :class_name))
          self.zen_associations = zen_associations.merge(name.to_sym => assoc)
        end

        # 调用 ActiveRecord 的 has_many 创建实际关联
        super(name, *args, **options)
      end

      # 定义 has_many through 关联
      #
      # has_many :tags, through: :article_tags
      def has_many_through(name, through, **options)
        # 保存 DSL 配置
        assoc = Zen::AssociationDefinition.new(name, :has_many_through, options.merge(through: through))
        self.zen_associations = zen_associations.merge(name.to_sym => assoc)
        
        # 调用 ActiveRecord 的 has_many 创建实际关联
        has_many(name, through: through, **options)
      end

      # 展示配置块
      def display(&block)
        config = Zen::DisplayConfig.new
        config.instance_eval(&block) if block
        self.zen_display_config = config.to_h
      end

      # 产品形态配置
      def product(type, **options)
        self.zen_product_configs = zen_product_configs + [{ type: type.to_sym, options: options }]
      end
    end

    # 获取字段定义
    def zen_field(name)
      self.class.zen_fields[name.to_sym]
    end

    # 获取所有字段定义
    def zen_all_fields
      self.class.zen_fields
    end

    # 获取关联定义
    def zen_association(name)
      self.class.zen_associations[name.to_sym]
    end

    # 获取所有关联定义
    def zen_all_associations
      self.class.zen_associations
    end

    # 获取 belongs_to 关联
    def zen_belongs_to_associations
      self.class.zen_associations.select { |_, a| a.belongs_to? }
    end

    # 获取 has_many 关联
    def zen_has_many_associations
      self.class.zen_associations.select { |_, a| a.has_many? || a.has_many_through? }
    end

    # 获取展示配置
    def zen_display
      self.class.zen_display_config
    end

    # 获取产品形态配置
    def zen_products
      self.class.zen_product_configs
    end
  end
end

# 加载子模块
require_relative "model_dsl/field_definition"
require_relative "model_dsl/association_definition"
require_relative "model_dsl/display_config"
require_relative "model_dsl/field_types"
