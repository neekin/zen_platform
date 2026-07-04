# frozen_string_literal: true

require "rails_helper"

RSpec.describe Admin::ArticlesController, type: :controller do
  let(:admin_user) { User.create!(email: "admin_articles_controller_spec@test.com", username: "admin_articles_controller_spec", name: "Admin", password: "password").tap { |u| u.add_role(:admin) } }
  let(:editor_user) { User.create!(email: "editor_articles_controller_spec@test.com", username: "editor_articles_controller_spec", name: "Editor", password: "password").tap { |u| u.add_role(:editor) } }

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

    context "when editor" do
      let(:current_user) { editor_user }

      it "allows access (editor has article index in defaults)" do
        get :index
        expect(response).to have_http_status(:success)
      end
    end
  end

  describe "POST #create" do
    let(:current_user) { admin_user }

    it "creates article successfully" do
      expect {
        post :create, params: { article: { title: "Test Article", status: "draft" } }
      }.to change(Article, :count).by(1)
    end

    it "redirects to show page" do
      post :create, params: { article: { title: "Test Article", status: "draft" } }
      expect(response).to redirect_to(admin_article_path(Article.last))
    end
  end

  describe "PATCH #update" do
    let(:current_user) { admin_user }
    let!(:article) { Article.create!(title: "Old Title", status: "draft") }

    it "updates article" do
      patch :update, params: { id: article.id, article: { title: "New Title" } }
      article.reload
      expect(article.title).to eq("New Title")
    end
  end

  describe "DELETE #destroy" do
    let(:current_user) { admin_user }
    let!(:article) { Article.create!(title: "To Delete", status: "draft") }

    it "deletes article" do
      expect {
        delete :destroy, params: { id: article.id }
      }.to change(Article, :count).by(-1)
    end
  end
end
