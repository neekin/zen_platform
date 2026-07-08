# frozen_string_literal: true

require "rails_helper"

RSpec.describe Zen::Resource, "lazy loading" do
  describe "AssociationDefinition#lazy?" do
    it "returns true when lazy option is set" do
      klass = Class.new(Zen::Resource) do
        has_many :notifications, lazy: true
      end

      assoc = klass.resource_associations[:notifications]
      expect(assoc.lazy?).to be true
    end

    it "returns false by default" do
      klass = Class.new(Zen::Resource) do
        has_many :notifications
      end

      assoc = klass.resource_associations[:notifications]
      expect(assoc.lazy?).to be false
    end

    it "includes lazy in to_h" do
      klass = Class.new(Zen::Resource) do
        has_many :notifications, lazy: true
      end

      assoc = klass.resource_associations[:notifications]
      expect(assoc.to_h[:lazy]).to be true
    end
  end

  describe "AssociationDefinition type checks" do
    it "belongs_to? returns true for belongs_to type" do
      klass = Class.new(Zen::Resource) do
        belongs_to :parent, lazy: true
      end
      assoc = klass.resource_associations[:parent]
      expect(assoc.belongs_to?).to be true
      expect(assoc.has_many?).to be false
    end

    it "has_many? returns true for has_many type" do
      klass = Class.new(Zen::Resource) do
        has_many :items, lazy: true
      end
      assoc = klass.resource_associations[:items]
      expect(assoc.has_many?).to be true
      expect(assoc.belongs_to?).to be false
    end
  end

  describe "Serializer with lazy associations" do
    let(:resource_class) do
      Class.new(Zen::Resource) do
        model User
        attribute :id, :integer
        attribute :email, :string
        attribute :name, :string

        has_many :notifications, lazy: true
        has_many :api_keys, lazy: true

        view :admin do
          include :id, :email, :name
          include_association :notifications
          include_association :api_keys
        end
      end
    end

    it "skips lazy has_many in serialization" do
      user = User.create!(
        email: "lazy_hasmany@example.com",
        username: "lazyhasmany",
        name: "Lazy HasMany",
        password: "password123"
      )

      serializer = Zen::Resource::Serializer.new(resource_class, :admin)
      result = serializer.serialize(user)

      expect(result).not_to have_key(:notifications)
      expect(result).not_to have_key(:api_keys)
    end
  end

  describe ".association_data" do
    let(:resource_class) do
      Class.new(Zen::Resource) do
        model User
        attribute :id, :integer
        attribute :email, :string
        attribute :name, :string

        has_many :notifications, lazy: true
        has_many :api_keys, lazy: true

        paginate per_page: 5, max_per_page: 20
      end
    end

    it "returns error for non-lazy association" do
      non_lazy_class = Class.new(Zen::Resource) do
        model User
        has_many :notifications
      end

      user = User.create!(
        email: "nonlazy@example.com",
        username: "nonlazy",
        name: "Non Lazy",
        password: "password123"
      )

      result = non_lazy_class.association_data(user.id, :notifications)
      expect(result.success?).to be false
      expect(result.errors.first).to include("未配置懒加载")
    end

    it "returns error for undefined association" do
      user = User.create!(
        email: "undefined@example.com",
        username: "undefined",
        name: "Undefined",
        password: "password123"
      )

      result = resource_class.association_data(user.id, :nonexistent)
      expect(result.success?).to be false
      expect(result.errors.first).to include("未定义")
    end

    it "returns error for non-existent record" do
      result = resource_class.association_data(999999, :notifications)
      expect(result.success?).to be false
      expect(result.errors.first).to include("记录不存在")
    end

    it "returns paginated has_many data" do
      user = User.create!(
        email: "paginate@example.com",
        username: "paginate",
        name: "Paginate",
        password: "password123"
      )

      result = resource_class.association_data(user.id, :notifications, { page: 1, per_page: 5 })
      expect(result.success?).to be true
      expect(result.data).to be_an(Array)
      expect(result.meta[:page]).to eq(1)
      expect(result.meta[:per_page]).to eq(5)
      expect(result.meta).to have_key(:total)
      expect(result.meta).to have_key(:total_pages)
    end
  end
end
