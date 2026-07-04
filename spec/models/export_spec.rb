# frozen_string_literal: true

require "rails_helper"

RSpec.describe Export, type: :model do
  let(:user) { User.create!(email: "test@test.com", username: "test", name: "Test", password: "pass") }

  describe "associations" do
    it "belongs to user" do
      expect(Export.reflect_on_association(:user).macro).to eq(:belongs_to)
    end
  end

  describe "validations" do
    it "requires format" do
      exp = Export.new(user: user, resource: "User", format: nil)
      expect(exp).not_to be_valid
    end

    it "validates format inclusion" do
      exp = Export.new(user: user, resource: "User", format: "xml")
      expect(exp).not_to be_valid
    end
  end

  describe "scopes" do
    let!(:pending) { Export.create!(user: user, resource: "User", format: "csv", status: "pending") }
    let!(:completed) { Export.create!(user: user, resource: "User", format: "csv", status: "completed") }

    it ".pending returns pending exports" do
      expect(Export.pending).to include(pending)
      expect(Export.pending).not_to include(completed)
    end
  end

  describe "status methods" do
    it "returns correct status" do
      exp = Export.create!(user: user, resource: "User", format: "csv", status: "completed")
      expect(exp.completed?).to be true
      expect(exp.pending?).to be false
    end
  end
end
