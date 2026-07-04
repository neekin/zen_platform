# frozen_string_literal: true

require "rails_helper"

RSpec.describe Admin::CommentsController, type: :controller do
  let(:admin_user) { User.create!(email: "admin_comments_controller_spec@test.com", username: "admin_comments_controller_spec", name: "Admin", password: "password").tap { |u| u.add_role(:admin) } }
  let(:editor_user) { User.create!(email: "editor_comments_controller_spec@test.com", username: "editor_comments_controller_spec", name: "Editor", password: "password").tap { |u| u.add_role(:editor) } }
  let!(:article) { Article.create!(title: "Test", status: "draft") }

  before do
    allow(controller).to receive(:current_user).and_return(current_user)
  end

  describe "GET #index" do
    context "when admin" do
      let(:current_user) { admin_user }

      it "returns success" do
        get :index
        expect(response).to have_http_status(:success)
      end
    end
  end

  describe "POST #create" do
    let(:current_user) { admin_user }

    it "creates comment" do
      expect {
        post :create, params: { comment: { author_name: "Author", content: "Content", article_id: article.id } }
      }.to change(Comment, :count).by(1)
    end
  end

  describe "DELETE #destroy" do
    let(:current_user) { admin_user }
    let!(:comment) { Comment.create!(author_name: "Author", content: "Content", article: article) }

    it "deletes comment" do
      expect {
        delete :destroy, params: { id: comment.id }
      }.to change(Comment, :count).by(-1)
    end
  end
end
