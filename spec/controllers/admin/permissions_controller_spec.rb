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
    it "updates permission and redirects" do
      patch :update, params: { role_name: "editor", resource: "Article", action_name: "create", allowed: "true" }
      expect(response).to redirect_to(admin_permissions_path)
      expect(flash[:notice]).to eq("权限已更新")
    end
  end

  describe "POST #reset" do
    it "resets permissions and redirects" do
      post :reset
      expect(response).to redirect_to(admin_permissions_path)
      expect(flash[:notice]).to eq("已重置为默认权限")
    end
  end
end
