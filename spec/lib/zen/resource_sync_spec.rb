# frozen_string_literal: true

require "rails_helper"

RSpec.describe Zen::Resource, "sync_from_model!" do
  # 创建一个模拟的 ModelDsl 字段定义
  let(:mock_field_class) do
    Class.new do
      attr_reader :name, :type, :options

      def initialize(name, type, options = {})
        @name = name.to_sym
        @type = type.to_sym
        @options = options
      end

      def required?
        options[:required] == true
      end

      def enum_values
        options[:values] || []
      end
    end
  end

  # 创建一个模拟的 ModelDsl 关联定义
  let(:mock_assoc_class) do
    Class.new do
      attr_reader :name, :type, :options

      def initialize(name, type, options = {})
        @name = name.to_sym
        @type = type.to_sym
        @options = options
      end

      def belongs_to?
        type == :belongs_to
      end

      def has_many?
        type == :has_many
      end

      def has_many_through?
        type == :has_many_through
      end

      def display_field
        options[:display] || :name
      end
    end
  end

  # 创建一个模拟的模型类，具有 zen_fields 和 zen_associations
  let(:mock_model) do
    fields = {
      title: mock_field_class.new(:title, :string, required: true),
      body: mock_field_class.new(:body, :rich_text),
      status: mock_field_class.new(:status, :enum, values: %w[draft published]),
      priority: mock_field_class.new(:priority, :integer)
    }

    associations = {
      author: mock_assoc_class.new(:author, :belongs_to, display: :name),
      comments: mock_assoc_class.new(:comments, :has_many),
      tags: mock_assoc_class.new(:tags, :has_many_through, through: :article_tags)
    }

    Class.new do
      define_singleton_method(:zen_fields) { fields }
      define_singleton_method(:zen_associations) { associations }
      define_singleton_method(:respond_to?) do |method_name, include_private = false|
        %i[zen_fields zen_associations].include?(method_name) || super(method_name, include_private)
      end
    end
  end

  describe "attribute sync" do
    it "syncs all fields from model" do
      resource_class = Class.new(Zen::Resource) do
        model nil # will be overridden below
      end
      # 手动设置 model_class 为 mock
      resource_class.instance_variable_set(:@model_class, mock_model)
      resource_class.sync_from_model!

      attrs = resource_class.resource_attributes
      expect(attrs).to have_key(:title)
      expect(attrs).to have_key(:body)
      expect(attrs).to have_key(:status)
      expect(attrs).to have_key(:priority)
    end

    it "preserves field type" do
      resource_class = Class.new(Zen::Resource) do
        model nil
      end
      resource_class.instance_variable_set(:@model_class, mock_model)
      resource_class.sync_from_model!

      attrs = resource_class.resource_attributes
      expect(attrs[:title].type).to eq(:string)
      expect(attrs[:body].type).to eq(:rich_text)
      expect(attrs[:status].type).to eq(:enum)
      expect(attrs[:priority].type).to eq(:integer)
    end

    it "syncs required flag" do
      resource_class = Class.new(Zen::Resource) do
        model nil
      end
      resource_class.instance_variable_set(:@model_class, mock_model)
      resource_class.sync_from_model!

      attrs = resource_class.resource_attributes
      expect(attrs[:title].required?).to be true
      expect(attrs[:body].required?).to be false
    end

    it "syncs enum values" do
      resource_class = Class.new(Zen::Resource) do
        model nil
      end
      resource_class.instance_variable_set(:@model_class, mock_model)
      resource_class.sync_from_model!

      attrs = resource_class.resource_attributes
      expect(attrs[:status].enum_values).to eq(%w[draft published])
    end

    it "sets searchable based on field type" do
      resource_class = Class.new(Zen::Resource) do
        model nil
      end
      resource_class.instance_variable_set(:@model_class, mock_model)
      resource_class.sync_from_model!

      attrs = resource_class.resource_attributes
      # string and enum are searchable, rich_text and integer are not
      expect(attrs[:title].searchable?).to be true
      expect(attrs[:status].searchable?).to be true
      expect(attrs[:body].searchable?).to be false
      expect(attrs[:priority].searchable?).to be false
    end
  end

  describe "association sync" do
    it "syncs belongs_to associations" do
      resource_class = Class.new(Zen::Resource) do
        model nil
      end
      resource_class.instance_variable_set(:@model_class, mock_model)
      resource_class.sync_from_model!

      assocs = resource_class.resource_associations
      expect(assocs).to have_key(:author)
      expect(assocs[:author].type).to eq(:belongs_to)
      expect(assocs[:author].display_field).to eq(:name)
    end

    it "syncs has_many associations" do
      resource_class = Class.new(Zen::Resource) do
        model nil
      end
      resource_class.instance_variable_set(:@model_class, mock_model)
      resource_class.sync_from_model!

      assocs = resource_class.resource_associations
      expect(assocs).to have_key(:comments)
      expect(assocs[:comments].type).to eq(:has_many)
    end

    it "syncs has_many_through associations" do
      resource_class = Class.new(Zen::Resource) do
        model nil
      end
      resource_class.instance_variable_set(:@model_class, mock_model)
      resource_class.sync_from_model!

      assocs = resource_class.resource_associations
      expect(assocs).to have_key(:tags)
      expect(assocs[:tags].type).to eq(:has_many)
    end
  end

  describe "override protection" do
    it "does not override explicitly defined attributes" do
      resource_class = Class.new(Zen::Resource) do
        model nil
        attribute :title, :string, required: true, searchable: true, readonly: true
      end
      resource_class.instance_variable_set(:@model_class, mock_model)
      resource_class.sync_from_model!

      attrs = resource_class.resource_attributes
      # 显式定义的 title 应该保留 readonly: true（sync 不会覆盖）
      expect(attrs[:title].readonly?).to be true
      expect(attrs[:title].required?).to be true
      expect(attrs[:title].searchable?).to be true
      # 但 body 等未显式定义的应该被同步
      expect(attrs).to have_key(:body)
    end

    it "does not override explicitly defined associations" do
      resource_class = Class.new(Zen::Resource) do
        model nil
        belongs_to :author, display: :email
      end
      resource_class.instance_variable_set(:@model_class, mock_model)
      resource_class.sync_from_model!

      assocs = resource_class.resource_associations
      # 显式定义的 author 使用 :email 作为 display，不应被覆盖为 :name
      expect(assocs[:author].display_field).to eq(:email)
      # 但 comments 等未显式定义的应该被同步
      expect(assocs).to have_key(:comments)
    end
  end

  describe "no-op when model has no DSL" do
    it "silently skips when model has no zen_fields" do
      plain_model = Class.new do
        define_singleton_method(:respond_to?) do |method_name, include_private = false|
          false # 不响应 zen_fields 或 zen_associations
        end
      end

      resource_class = Class.new(Zen::Resource) do
        model nil
      end
      resource_class.instance_variable_set(:@model_class, plain_model)
      expect { resource_class.sync_from_model! }.not_to raise_error
      expect(resource_class.resource_attributes).to be_nil
    end
  end

  describe "integration with User model" do
    it "runs without error on User (which has no field definitions)" do
      resource_class = Class.new(Zen::Resource) do
        model User
        sync_from_model!
      end

      expect(resource_class.model_class).to eq(User)
      # User 没有 field :xxx 定义，zen_fields 为空，所以不会同步任何字段
    end

    it "preserves explicitly defined attributes over empty sync" do
      resource_class = Class.new(Zen::Resource) do
        model User
        attribute :email, :string, required: true, searchable: true
        sync_from_model!
      end

      expect(resource_class.resource_attributes[:email].required?).to be true
      expect(resource_class.resource_attributes[:email].searchable?).to be true
    end
  end
end
