# frozen_string_literal: true

module Admin
  class DashboardController < AdminController
    before_action :require_login

    def index
      render inertia: "admin/Dashboard"
    end
  end
end
