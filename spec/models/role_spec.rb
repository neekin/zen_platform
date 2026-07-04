# frozen_string_literal: true

require "rails_helper"

RSpec.describe Role, type: :model do
  describe "associations" do
    it "has and belongs to many users" do
      expect(Role.reflect_on_association(:users).macro).to eq(:has_and_belongs_to_many)
    end
  end

  describe "creation" do
    it "creates role with name" do
      role = Role.create!(name: "test_role")
      expect(role.persisted?).to be true
    end
  end

  describe "user assignment" do
    let(:user) { User.create!(email: "test@test.com", username: "test", name: "Test", password: "pass") }

    it "assigns role to user" do
      user.add_role(:manager)
      expect(user.has_role?(:manager)).to be true
    end
  end
end
