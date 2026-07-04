# frozen_string_literal: true

require "rails_helper"

RSpec.describe CommentPolicy, type: :policy do
  let(:super_admin) { User.create!(username: "sa2", email: "sa2@test.com", name: "SA", password: "pass123").tap { |u| u.add_role(:super_admin) } }
  let(:admin) { User.create!(username: "adm2", email: "adm2@test.com", name: "Admin", password: "pass123").tap { |u| u.add_role(:admin) } }
  let(:article) { Article.create!(title: "Test", status: "draft") }
  let(:comment) { Comment.create!(author_name: "Author", content: "Content", article: article) }

  describe "#index?" do
    it "allows super_admin" do
      expect(CommentPolicy.new(super_admin, Comment).index?).to be true
    end

    it "allows admin" do
      expect(CommentPolicy.new(admin, Comment).index?).to be true
    end
  end

  describe "#destroy?" do
    it "allows super_admin" do
      expect(CommentPolicy.new(super_admin, comment).destroy?).to be true
    end
  end
end
