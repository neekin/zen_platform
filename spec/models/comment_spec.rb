# frozen_string_literal: true

require "rails_helper"

RSpec.describe Comment, type: :model do
  let!(:article) { Article.create!(title: "Test", status: "draft") }

  describe "associations" do
    it "belongs to article" do
      expect(Comment.reflect_on_association(:article).macro).to eq(:belongs_to)
    end
  end

  describe "validations" do
    it "is valid with required fields" do
      comment = Comment.new(author_name: "Author", content: "test", article: article)
      expect(comment).to be_valid
    end
  end

  describe "creation" do
    it "creates valid comment" do
      comment = Comment.create!(author_name: "Author", content: "Great article!", article: article)
      expect(comment.persisted?).to be true
    end
  end
end
