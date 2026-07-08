# frozen_string_literal: true

require "rails_helper"

RSpec.describe Admin::SessionsController, type: :controller do
  let!(:user) { User.create!(email: "admin_sessions_controller_spec@test.com", username: "admin_sessions_controller_spec", name: "Admin", password: "password123") }

  describe "POST #create" do
    it "logs in with valid credentials" do
      post :create, params: { account: "admin_sessions_controller_spec@test.com", password: "password123" }
      expect(response).to redirect_to(admin_root_path)
    end

    it "rejects invalid credentials" do
      post :create, params: { account: "admin_sessions_controller_spec@test.com", password: "wrong" }
      expect(response).to redirect_to(admin_login_path)
    end
  end

  describe "DELETE #destroy" do
    before do
      allow(controller).to receive(:current_user).and_return(user)
    end

    it "logs out" do
      delete :destroy
      expect(response).to redirect_to(admin_login_path)
    end
  end
end
