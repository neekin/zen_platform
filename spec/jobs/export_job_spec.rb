# frozen_string_literal: true

require "rails_helper"

RSpec.describe ExportJob, type: :job do
  let(:user) { User.create!(username: "exporter", email: "exp@test.com", name: "Exporter", password: "pass123") }

  describe "ALLOWED_RESOURCES" do
    it "is an array" do
      expect(described_class::ALLOWED_RESOURCES).to be_an(Array)
    end

    it "does not include User or ApiKey" do
      expect(described_class::ALLOWED_RESOURCES).not_to include("User", "ApiKey")
    end
  end

  describe "ALLOWED_FILTER_COLUMNS" do
    it "includes common filter columns" do
      expect(described_class::ALLOWED_FILTER_COLUMNS).to include("status", "created_at")
    end
  end

  describe "#perform" do
    it "raises on unauthorized resource" do
      export = Export.create!(user: user, format: "csv", resource: "UnauthorizedModel", status: "pending")
      expect { described_class.perform_now(export.id) }.to raise_error(RuntimeError, /Unauthorized resource/)
    end

    it "updates status to failed on error" do
      export = Export.create!(user: user, format: "csv", resource: "UnauthorizedModel", status: "pending")
      described_class.perform_now(export.id) rescue nil
      expect(export.reload.status).to eq("failed")
    end
  end
end
