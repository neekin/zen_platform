# frozen_string_literal: true

require "rails_helper"

RSpec.describe User, type: :model do
  let!(:user) { User.create!(username: "testuser", email: "test@example.com", name: "Test User", password: "password123") }

  describe "validations" do
    it "requires email" do
      u = User.new(username: "x", email: nil, name: "X", password: "pass123")
      expect(u).not_to be_valid
      expect(u.errors[:email]).to include("can't be blank")
    end

    it "requires unique email" do
      dup = User.new(username: "other", email: "test@example.com", name: "Other", password: "password123")
      expect(dup).not_to be_valid
    end

    it "requires unique username" do
      dup = User.new(username: "testuser", email: "other@example.com", name: "Other", password: "password123")
      expect(dup).not_to be_valid
    end

    it "requires name" do
      u = User.new(username: "x", email: "x@x.com", name: nil, password: "pass123")
      expect(u).not_to be_valid
    end
  end

  describe ".find_by_account" do
    it "finds by email" do
      found = User.find_by_account("test@example.com")
      expect(found).to be_present
      expect(found.id).to eq(user.id)
    end

    it "finds by username" do
      found = User.find_by_account("testuser")
      expect(found).to be_present
      expect(found.id).to eq(user.id)
    end

    it "returns nil for unknown account" do
      expect(User.find_by_account("unknown")).to be_nil
    end
  end

  describe "associations" do
    it "has many api_keys" do
      expect(user).to respond_to(:api_keys)
    end

    it "has many notifications" do
      expect(user).to respond_to(:notifications)
    end

    it "has many exports" do
      expect(user).to respond_to(:exports)
    end
  end

  describe "roles" do
    it "can add and check roles" do
      user.add_role(:admin)
      expect(user.has_role?(:admin)).to be true
      expect(user.has_role?(:viewer)).to be false
    end

    it "supports has_any_role?" do
      user.add_role(:editor)
      expect(user.has_any_role?(:admin, :editor)).to be true
      expect(user.has_any_role?(:admin, :super_admin)).to be false
    end
  end
end
