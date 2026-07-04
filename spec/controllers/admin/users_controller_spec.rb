# frozen_string_literal: true

require "rails_helper"

RSpec.describe Admin::UsersController, type: :controller do
  let(:admin_user) { User.create!(email: "admin_users_controller_spec@test.com", username: "admin_users_controller_spec", name: "Admin", password: "password").tap { |u| u.add_role(:admin) } }

  before do
    allow(controller).to receive(:current_user).and_return(admin_user)
  end

  describe "GET #index" do
    it "returns success" do
      get :index
      expect(response).to have_http_status(:success)
    end
  end

  describe "POST #create" do
    it "creates user" do
      expect {
        post :create, params: { user: { email: "new@test.com", username: "new", name: "New", password: "password123" } }
      }.to change(User, :count).by(1)
    end
  end

  describe "PATCH #update" do
    let!(:target_user) { User.create!(email: "target@test.com", username: "target", name: "Target", password: "password") }

    it "updates user name" do
      patch :update, params: { id: target_user.id, user: { name: "Updated" } }
      target_user.reload
      expect(target_user.name).to eq("Updated")
    end
  end

  describe "DELETE #destroy" do
    let!(:target_user) { User.create!(email: "target@test.com", username: "target", name: "Target", password: "password") }

    it "deletes user" do
      expect {
        delete :destroy, params: { id: target_user.id }
      }.to change(User, :count).by(-1)
    end

    it "prevents self-deletion" do
      expect {
        delete :destroy, params: { id: admin_user.id }
      }.not_to change(User, :count)
    end
  end
end
