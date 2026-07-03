# frozen_string_literal: true

require "rails_helper"

RSpec.describe ApiKey, type: :model do
  let(:user) { User.create!(username: "apiuser", email: "api@test.com", name: "API User", password: "pass123") }
  let(:api_key) { ApiKey.create!(user: user, name: "Test Key") }

  describe ".active" do
    it "includes keys without expiry" do
      expect(ApiKey.active).to include(api_key)
    end

    it "includes non-expired keys" do
      api_key.update!(expires_at: 1.day.from_now)
      expect(ApiKey.active).to include(api_key)
    end

    it "excludes expired keys" do
      api_key.update!(expires_at: 1.day.ago)
      expect(ApiKey.active).not_to include(api_key)
    end
  end

  describe "#expired?" do
    it "returns false for nil expires_at" do
      expect(api_key.expired?).to be false
    end

    it "returns false for future expires_at" do
      api_key.update!(expires_at: 1.day.from_now)
      expect(api_key.expired?).to be false
    end

    it "returns true for past expires_at" do
      api_key.update!(expires_at: 1.day.ago)
      expect(api_key.expired?).to be true
    end
  end

  describe "key generation" do
    it "auto-generates a 64-char hex key" do
      expect(api_key.key).to be_present
      expect(api_key.key.length).to eq(64)
    end

    it "generates unique keys" do
      key2 = ApiKey.create!(user: user, name: "Another Key")
      expect(key2.key).not_to eq(api_key.key)
    end
  end
end
