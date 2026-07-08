# frozen_string_literal: true

require "rails_helper"

RSpec.describe Api::JwtAuthenticatable, type: :controller do
  # Tested via request specs in spec/requests/api/v1/auth_spec.rb
  # This file exists as a placeholder for future unit-level tests

  describe "JWT encode/decode roundtrip" do
    it "encodes and decodes a user_id" do
      # Access private methods via send for unit testing
      controller = ApplicationController.new
      controller.extend(Api::JwtAuthenticatable)

      token = controller.send(:encode_jwt, 42)
      payload = controller.send(:decode_jwt, token)

      expect(payload["user_id"]).to eq(42)
    end

    it "returns nil for expired tokens" do
      controller = ApplicationController.new
      controller.extend(Api::JwtAuthenticatable)

      token = controller.send(:encode_jwt, 42, 1.second.ago)
      payload = controller.send(:decode_jwt, token)

      expect(payload).to be_nil
    end

    it "returns nil for invalid tokens" do
      controller = ApplicationController.new
      controller.extend(Api::JwtAuthenticatable)

      payload = controller.send(:decode_jwt, "invalid.token.here")
      expect(payload).to be_nil
    end
  end
end
