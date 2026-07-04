# frozen_string_literal: true

require "rails_helper"

RSpec.describe Admin::PermissionsController, type: :controller do
  let(:admin_user) { User.create!(email: "admin_permissions_controller_spec@test.com", username: "admin_permissions_controller_spec", name: "Admin", password: "password").tap { |u| u.add_role(:super_admin) } }

  before do
    allow(controller).to receive(:current_user).and_return(admin_user)
  end

  describe "GET #index" do
    it "returns success" do
      get :index
      expect(response).to have_http_status(:success)
    end
  end

  describe "PATCH #update" do
    it "updates permission and returns JSON" do
      patch :update, params: { role_name: "editor", resource: "Article", action_name: "create", allowed: "true" }
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["code"]).to eq(0)
    end
  end

  describe "POST #reset" do
    it "resets permissions and returns JSON" do
      post :reset
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json["code"]).to eq(0)
    end
  end
end
