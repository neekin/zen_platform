# frozen_string_literal: true

require "rails_helper"

RSpec.describe Zen::ModelDsl, type: :model do
  describe "field definitions" do
    it "registers fields via DSL" do
      expect(Article.zen_fields).to have_key(:title)
      expect(Article.zen_fields).to have_key(:status)
      expect(Article.zen_fields).to have_key(:body)
    end

    it "stores field type" do
      expect(Article.zen_fields[:title].type).to eq(:string)
      expect(Article.zen_fields[:status].type).to eq(:enum)
    end

    it "stores required flag" do
      expect(Article.zen_fields[:title].required?).to be true
    end

    it "stores enum values" do
      expect(Article.zen_fields[:status].enum_values).to eq(%w[draft published archived])
    end
  end

  describe "association definitions" do
    it "registers belongs_to associations" do
      expect(Article.zen_associations).to have_key(:category)
      expect(Article.zen_associations[:category].belongs_to?).to be true
    end
  end

  describe "display config" do
    it "stores list columns" do
      config = Article.zen_display_config
      expect(config).to be_present
    end
  end
end
