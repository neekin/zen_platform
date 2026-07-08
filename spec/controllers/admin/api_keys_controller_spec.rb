# frozen_string_literal: true

require "rails_helper"

RSpec.describe Admin::ApiKeysController, type: :controller do
  let(:admin_user) { User.create!(email: "admin_api_keys_controller_spec@test.com", username: "admin_api_keys_controller_spec", name: "Admin", password: "password").tap { |u| u.add_role(:admin) } }

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
    it "creates api key" do
      expect {
        post :create, params: { api_key: { name: "Test Key", user_id: admin_user.id } }
      }.to change(ApiKey, :count).by(1)
    end
  end

  describe "DELETE #destroy" do
    let!(:api_key) { admin_user.api_keys.create!(name: "Test") }

    it "deletes api key" do
      expect {
        delete :destroy, params: { id: api_key.id }
      }.to change(ApiKey, :count).by(-1)
    end
  end
end
