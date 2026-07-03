# frozen_string_literal: true

module Admin
  class DashboardController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped
    before_action :require_login

    def index
      render inertia: "admin/Dashboard"
    end
  end
end
