# frozen_string_literal: true

require "rails_helper"

RSpec.describe Admin::ExportsController, type: :controller do
  let(:admin_user) { User.create!(email: "admin_exports_controller_spec@test.com", username: "admin_exports_controller_spec", name: "Admin", password: "password").tap { |u| u.add_role(:admin) } }

  before do
    allow(controller).to receive(:current_user).and_return(admin_user)
  end

  describe "POST #create" do
    it "rejects resource not in ALLOWED_EXPORT_RESOURCES" do
      post :create, params: { resource: "Article", format: "csv" }
      expect(response).to redirect_to(admin_root_path)
    end

    it "rejects invalid resource" do
      post :create, params: { resource: "User", format: "csv" }
      expect(response).to redirect_to(admin_root_path)
    end
  end

  describe "GET #show" do
    let!(:export) { Export.create!(user: admin_user, format: "csv", resource: "Article", status: "pending") }

    it "redirects when not completed" do
      get :show, params: { id: export.id }
      expect(response).to redirect_to(admin_root_path)
    end
  end
end
