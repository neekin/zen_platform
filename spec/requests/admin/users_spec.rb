# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Admin::Users", type: :request do
  let!(:admin_user) do
    user = User.create!(
      email: "admin@example.com",
      username: "admin",
      name: "Admin User",
      password: "password123"
    )
    user.add_role(:super_admin)
    user
  end

  let!(:regular_user) do
    User.create!(
      email: "user@example.com",
      username: "user",
      name: "Regular User",
      password: "password123"
    )
  end

  describe "GET /admin/users" do
    context "when not authenticated" do
      it "redirects to login" do
        get admin_users_path
        expect(response).to have_http_status(:redirect)
      end
    end

    context "when authenticated as admin" do
      before { sign_in admin_user }

      it "returns success" do
        get admin_users_path
        expect(response).to have_http_status(:ok)
      end

      it "returns correct pagination structure" do
        get admin_users_path
        page = Nokogiri::HTML(response.body)
        inertia_data = page.at("[data-page]")
        props = JSON.parse(inertia_data["data-page"])

        # 验证 pagination 存在且结构正确
        expect(props["pagination"]).to be_a(Hash)
        expect(props["pagination"]["page"]).to eq(1)
        expect(props["pagination"]["per_page"]).to eq(20)
        expect(props["pagination"]["total"]).to be >= 2
        expect(props["pagination"]["pagination_type"]).to eq("offset")
      end

      it "returns users data" do
        get admin_users_path
        page = Nokogiri::HTML(response.body)
        inertia_data = page.at("[data-page]")
        props = JSON.parse(inertia_data["data-page"])

        expect(props["users"]).to be_an(Array)
        expect(props["users"].length).to be >= 2
      end

      it "returns roles data" do
        get admin_users_path
        page = Nokogiri::HTML(response.body)
        inertia_data = page.at("[data-page]")
        props = JSON.parse(inertia_data["data-page"])

        expect(props["roles"]).to be_an(Array)
      end

      it "does not expose password_digest" do
        get admin_users_path
        page = Nokogiri::HTML(response.body)
        inertia_data = page.at("[data-page]")
        props = JSON.parse(inertia_data["data-page"])

        props["users"].each do |user|
          expect(user).not_to have_key("password_digest")
          expect(user).not_to have_key("password")
        end
      end
    end
  end
end
