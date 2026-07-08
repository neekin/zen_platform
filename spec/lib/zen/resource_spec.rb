# frozen_string_literal: true

require "rails_helper"

RSpec.describe Zen::Resource do
  describe "attribute definitions" do
    let(:resource_class) do
      Class.new(Zen::Resource) do
        attribute :name, :string, required: true
        attribute :status, :enum, values: %w[active inactive]
      end
    end

    it "registers attributes" do
      expect(resource_class.resource_attributes).to have_key(:name)
      expect(resource_class.resource_attributes).to have_key(:status)
    end

    it "stores attribute type" do
      expect(resource_class.resource_attributes[:name].type).to eq(:string)
      expect(resource_class.resource_attributes[:status].type).to eq(:enum)
    end

    it "stores required flag" do
      expect(resource_class.resource_attributes[:name].required?).to be true
      expect(resource_class.resource_attributes[:status].required?).to be false
    end

    it "stores enum values" do
      expect(resource_class.resource_attributes[:status].enum_values).to eq(%w[active inactive])
    end
  end

  describe "association definitions" do
    let(:resource_class) do
      Class.new(Zen::Resource) do
        belongs_to :role, display: :name
        has_many :notifications, count_only: true
      end
    end

    it "stores belongs_to association" do
      assoc = resource_class.resource_associations[:role]
      expect(assoc.type).to eq(:belongs_to)
      expect(assoc.display_field).to eq(:name)
    end

    it "stores has_many association" do
      assoc = resource_class.resource_associations[:notifications]
      expect(assoc.type).to eq(:has_many)
      expect(assoc.count_only?).to be true
    end
  end

  describe "pagination" do
    let(:resource_class) do
      Class.new(Zen::Resource) do
        paginate per_page: 10, max_per_page: 50
      end
    end

    it "stores pagination config" do
      expect(resource_class.pagination_config[:per_page]).to eq(10)
      expect(resource_class.pagination_config[:max_per_page]).to eq(50)
    end
  end

  describe "sortable fields" do
    let(:resource_class) do
      Class.new(Zen::Resource) do
        sortable :created_at, :name, :email
      end
    end

    it "stores sortable fields" do
      expect(resource_class.sortable_fields).to eq([:created_at, :name, :email])
    end
  end

  describe "view configs" do
    let(:resource_class) do
      Class.new(Zen::Resource) do
        attribute :id, :integer
        attribute :email, :string
        attribute :name, :string

        view :admin do
          include :id, :email, :name
        end

        view :public do
          include :id, :name
          exclude :email
        end
      end
    end

    it "resolves admin view fields" do
      view = resource_class.view_config(:admin)
      expect(view.resolved_fields(resource_class.resource_attributes)).to eq([:id, :email, :name])
    end

    it "resolves public view fields with exclusion" do
      view = resource_class.view_config(:public)
      expect(view.resolved_fields(resource_class.resource_attributes)).to eq([:id, :name])
    end
  end

  describe "searchable_fields" do
    let(:resource_class) do
      Class.new(Zen::Resource) do
        attribute :email, :string, searchable: true
        attribute :name, :string, searchable: true
        attribute :status, :enum
      end
    end

    it "returns only searchable fields" do
      expect(resource_class.searchable_fields).to eq([:email, :name])
    end
  end

  describe "default_includes" do
    it "stores includes associations" do
      klass = Class.new(Zen::Resource) do
        model User
        includes :role, :notifications
      end

      expect(klass.default_includes).to eq([:role, :notifications])
    end

    it "returns nil when not set" do
      klass = Class.new(Zen::Resource) do
        model User
      end

      expect(klass.default_includes).to be_nil
    end
  end
end
