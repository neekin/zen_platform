# frozen_string_literal: true

require "rails_helper"

RSpec.describe Admin::RolesController, type: :controller do
  let(:admin_user) { User.create!(email: "admin_roles_controller_spec@test.com", username: "admin_roles_controller_spec", name: "Admin", password: "password").tap { |u| u.add_role(:super_admin) } }

  before do
    allow(controller).to receive(:current_user).and_return(admin_user)
    # Ensure builtin roles exist
    %w[super_admin admin editor viewer].each { |r| Role.find_or_create_by(name: r) }
  end

  describe "GET #index" do
    it "returns success" do
      get :index
      expect(response).to have_http_status(:success)
    end
  end

  describe "POST #create" do
    it "creates role" do
      expect {
        post :create, params: { name: "test_role" }
      }.to change(Role, :count).by(1)
    end
  end

  describe "DELETE #destroy" do
    let!(:role) { Role.create!(name: "test_role") }

    it "deletes non-builtin role" do
      expect {
        delete :destroy, params: { id: role.id }
      }.to change(Role, :count).by(-1)
    end

    it "prevents deleting builtin roles" do
      admin_role = Role.find_by!(name: "admin")
      expect {
        delete :destroy, params: { id: admin_role.id }
      }.not_to change(Role, :count)
    end
  end
end
