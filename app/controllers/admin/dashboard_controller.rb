# frozen_string_literal: true

module Admin
  class DashboardController < AdminController
    skip_after_action :verify_authorized
    skip_after_action :verify_policy_scoped
    before_action :require_login

    def index
      render inertia: "admin/Dashboard", props: {
        stats: {
          user_count: User.count,
          role_count: Role.count
        },
        framework: {
          name: "Zen Platform",
          version: "0.3.0",
          rails_version: Rails::VERSION::STRING,
          ruby_version: RUBY_VERSION
        }
      }
    end
  end
end
