# frozen_string_literal: true

require "rails_helper"

RSpec.describe ArticlePolicy, type: :policy do
  let(:admin) { User.create!(username: "adm2", email: "adm2@test.com", name: "Admin", password: "pass123").tap { |u| u.add_role(:admin) } }
  let(:viewer) { User.create!(username: "vw2", email: "vw2@test.com", name: "Viewer", password: "pass123").tap { |u| u.add_role(:viewer) } }
  let!(:published) { Article.create!(title: "Pub", body: "Content", status: :published) }
  let!(:draft) { Article.create!(title: "Draft", body: "Content", status: :draft) }

  describe "Scope" do
    it "returns all articles for admin" do
      scope = Pundit.policy_scope(admin, Article)
      expect(scope.count).to eq(2)
    end

    it "returns only published articles for non-admin" do
      scope = Pundit.policy_scope(viewer, Article)
      expect(scope).to include(published)
      expect(scope).not_to include(draft)
    end
  end

  describe "#create?" do
    it "allows admin" do
      expect(described_class.new(admin, Article.new).create?).to be true
    end

    it "denies viewer" do
      expect(described_class.new(viewer, Article.new).create?).to be false
    end
  end
end
