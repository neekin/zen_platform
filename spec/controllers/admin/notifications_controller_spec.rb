# frozen_string_literal: true

require "rails_helper"

RSpec.describe Admin::NotificationsController, type: :controller do
  let(:admin_user) { User.create!(email: "admin_notifications_controller_spec@test.com", username: "admin_notifications_controller_spec", name: "Admin", password: "password").tap { |u| u.add_role(:admin) } }

  before do
    allow(controller).to receive(:current_user).and_return(admin_user)
  end

  describe "GET #index" do
    it "returns success" do
      get :index
      expect(response).to have_http_status(:success)
    end
  end

  describe "POST #mark_as_read" do
    let!(:notification) { Notification.create!(recipient: admin_user, action: "test") }

    it "marks notification as read" do
      post :mark_as_read, params: { id: notification.id }
      notification.reload
      expect(notification.read).to be true
    end
  end

  describe "POST #mark_all_as_read" do
    let!(:notification) { Notification.create!(recipient: admin_user, action: "test") }

    it "marks all as read" do
      post :mark_all_as_read
      notification.reload
      expect(notification.read).to be true
    end
  end
end
