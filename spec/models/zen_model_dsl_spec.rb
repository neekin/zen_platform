# frozen_string_literal: true

require "rails_helper"

RSpec.describe Zen::ModelDsl, type: :model do
  # 使用匿名类测试 DSL，不依赖具体业务模型
  let(:dsl_class) do
    Class.new(ApplicationRecord) do
      include Zen::ModelDsl
      self.abstract_class = true

      field :title, :string, required: true, placeholder: "请输入标题"
      field :status, :enum, values: %w[draft published archived], default: "draft"
      field :is_active, :boolean, default: true
    end
  end

  describe "field definitions" do
    it "registers fields via DSL" do
      expect(dsl_class.zen_fields).to have_key(:title)
      expect(dsl_class.zen_fields).to have_key(:status)
      expect(dsl_class.zen_fields).to have_key(:is_active)
    end

    it "stores field type" do
      expect(dsl_class.zen_fields[:title].type).to eq(:string)
      expect(dsl_class.zen_fields[:status].type).to eq(:enum)
      expect(dsl_class.zen_fields[:is_active].type).to eq(:boolean)
    end

    it "stores required flag" do
      expect(dsl_class.zen_fields[:title].required?).to be true
      expect(dsl_class.zen_fields[:status].required?).to be false
    end

    it "stores enum values" do
      expect(dsl_class.zen_fields[:status].enum_values).to eq(%w[draft published archived])
    end

    it "stores default value" do
      expect(dsl_class.zen_fields[:status].options[:default]).to eq("draft")
      expect(dsl_class.zen_fields[:is_active].options[:default]).to be true
    end
  end

  describe "display config" do
    it "stores list columns" do
      dsl_class.display do
        list do
          column :title, link: true
          column :status, badge: true
        end
      end

      config = dsl_class.zen_display_config
      expect(config).to be_present
      expect(config[:list]).to be_present
      expect(config[:list][:columns]).to be_present
      expect(config[:list][:columns].length).to eq(2)
    end

    it "stores form sections" do
      dsl_class.display do
        form do
          section "基本信息" do
            field :title, required: true
            field :status, as: :radio
          end
        end
      end

      config = dsl_class.zen_display_config
      expect(config[:form]).to be_present
      expect(config[:form][:sections]).to be_present
      expect(config[:form][:sections].length).to eq(1)
    end
  end

  describe "zen_meta" do
    it "returns metadata hash with fields and display config" do
      dsl_class.display do
        list do
          column :title
        end
      end

      meta = dsl_class.zen_meta
      expect(meta).to have_key(:fields)
      expect(meta).to have_key(:display)
      expect(meta[:fields]).to be_a(Hash)
    end
  end
end
