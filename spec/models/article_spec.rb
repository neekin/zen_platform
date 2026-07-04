# frozen_string_literal: true

require "rails_helper"

RSpec.describe Article, type: :model do
  describe "associations" do
    it "has many comments" do
      expect(Article.reflect_on_association(:comments).macro).to eq(:has_many)
    end

    it "belongs to user (optional)" do
      assoc = Article.reflect_on_association(:user)
      expect(assoc.macro).to eq(:belongs_to)
      expect(assoc.options[:optional]).to be true
    end
  end

  describe "validations" do
    it "is valid with title" do
      article = Article.new(title: "Test", status: "draft")
      expect(article).to be_valid
    end
  end

  describe "scopes" do
    let!(:published) { Article.create!(title: "Published", status: "published") }
    let!(:draft) { Article.create!(title: "Draft", status: "draft") }

    it ".published returns only published articles" do
      expect(Article.published).to include(published)
      expect(Article.published).not_to include(draft)
    end
  end

  describe "DSL" do
    it "responds to zen_meta" do
      expect(Article).to respond_to(:zen_meta)
    end

    it "has field definitions" do
      meta = Article.zen_meta
      expect(meta[:fields]).to have_key(:title)
      expect(meta[:fields]).to have_key(:body)
      expect(meta[:fields]).to have_key(:status)
    end
  end
end
