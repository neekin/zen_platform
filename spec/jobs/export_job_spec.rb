# frozen_string_literal: true

require "rails_helper"

RSpec.describe ExportJob, type: :job do
  let(:user) { User.create!(username: "exporter", email: "exp@test.com", name: "Exporter", password: "pass123") }

  describe "ALLOWED_RESOURCES" do
    it "includes Article, Task, Product" do
      expect(described_class::ALLOWED_RESOURCES).to include("Article", "Task", "Product")
    end

    it "does not include User or ApiKey" do
      expect(described_class::ALLOWED_RESOURCES).not_to include("User", "ApiKey")
    end
  end

  describe "ALLOWED_FILTER_COLUMNS" do
    it "includes common filter columns" do
      expect(described_class::ALLOWED_FILTER_COLUMNS).to include("status", "category_id")
    end
  end

  describe "#perform" do
    let!(:article) { Article.create!(title: "Export Test", body: "Content", status: :published) }

    it "raises on unauthorized resource" do
      export = Export.create!(user: user, format: "csv", resource: "User", status: "pending")
      expect { described_class.perform_now(export.id) }.to raise_error(RuntimeError, /Unauthorized resource/)
    end

    it "completes export for valid resource" do
      export = Export.create!(user: user, format: "csv", resource: "Article", status: "pending")
      described_class.perform_now(export.id)
      expect(export.reload.status).to eq("completed")
      expect(export.row_count).to eq(1)
    end

    it "creates notification on completion" do
      export = Export.create!(user: user, format: "csv", resource: "Article", status: "pending")
      expect {
        described_class.perform_now(export.id)
      }.to change(Notification, :count).by(1)
    end
  end
end
