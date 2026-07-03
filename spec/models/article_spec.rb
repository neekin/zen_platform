# frozen_string_literal: true

require "rails_helper"

RSpec.describe Article, type: :model do
  let!(:article) { Article.create!(title: "Test", body: "Content", status: :draft) }

  describe "validations" do
    it "persists with valid attributes" do
      expect(article).to be_persisted
      expect(article.title).to eq("Test")
    end
  end

  describe "enum" do
    it "defines status enum" do
      expect(Article.statuses).to eq({ "draft" => 0, "published" => 1, "archived" => 2 })
    end

    it "has correct default status" do
      expect(article.status).to eq("draft")
    end

    it "can transition statuses" do
      article.published!
      expect(article.reload.status).to eq("published")
    end
  end

  describe "associations" do
    it "belongs_to category optionally" do
      expect(article.category).to be_nil
      expect(article).to be_valid
    end
  end

  describe "track_changes" do
    it "creates PaperTrail versions on update" do
      expect { article.update!(title: "Updated") }.to change { PaperTrail::Version.count }.by(1)
    end

    it "records object_changes" do
      article.update!(title: "Changed")
      version = PaperTrail::Version.last
      expect(version.object_changes).to include("title")
    end
  end
end
