# frozen_string_literal: true

require "rails_helper"

RSpec.describe ArticlePolicy, type: :policy do
  let(:super_admin) { User.create!(username: "sa", email: "sa@test.com", name: "SA", password: "pass123").tap { |u| u.add_role(:super_admin) } }
  let(:admin) { User.create!(username: "adm", email: "adm@test.com", name: "Admin", password: "pass123").tap { |u| u.add_role(:admin) } }
  let(:editor) { User.create!(username: "ed", email: "ed@test.com", name: "Editor", password: "pass123").tap { |u| u.add_role(:editor) } }
  let(:article) { Article.create!(title: "Test", status: "draft") }

  describe "#index?" do
    it "allows super_admin" do
      expect(ArticlePolicy.new(super_admin, Article).index?).to be true
    end

    it "allows admin" do
      expect(ArticlePolicy.new(admin, Article).index?).to be true
    end
  end

  describe "#create?" do
    it "allows super_admin" do
      expect(ArticlePolicy.new(super_admin, article).create?).to be true
    end

    it "allows admin" do
      expect(ArticlePolicy.new(admin, article).create?).to be true
    end
  end

  describe "#destroy?" do
    it "allows super_admin" do
      expect(ArticlePolicy.new(super_admin, article).destroy?).to be true
    end
  end
end
