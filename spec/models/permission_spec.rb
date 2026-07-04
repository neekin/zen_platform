# frozen_string_literal: true

require "rails_helper"

RSpec.describe Permission, type: :model do
  describe "validations" do
    it "requires role_name" do
      perm = Permission.new(role_name: nil, resource: "User", action_name: "index")
      expect(perm).not_to be_valid
    end

    it "requires resource" do
      perm = Permission.new(role_name: "admin", resource: nil, action_name: "index")
      expect(perm).not_to be_valid
    end

    it "requires action_name" do
      perm = Permission.new(role_name: "admin", resource: "User", action_name: nil)
      expect(perm).not_to be_valid
    end

    it "enforces uniqueness" do
      Permission.create!(role_name: "custom_role", resource: "User", action_name: "index")
      dup = Permission.new(role_name: "custom_role", resource: "User", action_name: "index")
      expect(dup).not_to be_valid
    end
  end

  describe ".allowed?" do
    it "returns true for super_admin (bypass)" do
      expect(Permission.allowed?("super_admin", "Anything", "destroy")).to be true
    end

    it "checks permission table" do
      Permission.create!(role_name: "editor", resource: "Article", action_name: "index")
      expect(Permission.allowed?("editor", "Article", "index")).to be true
      expect(Permission.allowed?("editor", "Article", "destroy")).to be false
    end
  end

  describe "RESOURCES" do
    it "derives from RESOURCE_ACTIONS" do
      expect(Permission::RESOURCES).to eq(Permission::RESOURCE_ACTIONS.keys.freeze)
    end
  end
end
