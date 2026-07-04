# frozen_string_literal: true

require "rails_helper"

RSpec.describe Admin::DashboardController, type: :controller do
  let(:admin_user) { User.create!(email: "admin_dashboard_controller_spec@test.com", username: "admin_dashboard_controller_spec", name: "Admin", password: "password").tap { |u| u.add_role(:admin) } }

  before do
    allow(controller).to receive(:current_user).and_return(admin_user)
  end

  describe "GET #index" do
    it "returns success" do
      get :index
      expect(response).to have_http_status(:success)
    end
  end
end
