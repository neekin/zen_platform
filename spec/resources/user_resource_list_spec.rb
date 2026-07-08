# frozen_string_literal: true

require "rails_helper"

RSpec.describe UserResource do
  describe ".list" do
    let!(:users) do
      [
        User.create!(email: "test1@example.com", username: "user1", name: "Test User 1", password: "password123"),
        User.create!(email: "test2@example.com", username: "user2", name: "Test User 2", password: "password123"),
        User.create!(email: "test3@example.com", username: "user3", name: "Test User 3", password: "password123")
      ]
    end

    it "返回 Result 对象" do
      result = UserResource.list({})
      expect(result).to be_a(Zen::Resource::Result)
      expect(result.success?).to be true
    end

    it "返回正确的数据格式" do
      result = UserResource.list({})
      props = result.to_inertia

      # 验证 data 存在
      expect(props[:data]).to be_an(Array)
      expect(props[:data].length).to eq(3)

      # 验证每个 user 的结构
      user_data = props[:data].first
      expect(user_data).to include(:id, :email, :username, :name)
      expect(user_data).not_to have_key(:password_digest)
    end

    it "返回正确的分页结构" do
      result = UserResource.list({ per_page: 2 })
      props = result.to_inertia

      # 验证 pagination 存在且结构正确
      expect(props[:pagination]).to be_a(Hash)
      expect(props[:pagination][:page]).to eq(1)
      expect(props[:pagination][:per_page]).to eq(2)
      expect(props[:pagination][:total]).to eq(3)
      expect(props[:pagination][:total_pages]).to eq(2)
      expect(props[:pagination][:pagination_type]).to eq("offset")

      # 验证扁平字段不存在
      expect(props[:page]).to be_nil
      expect(props[:per_page]).to be_nil
    end

    it "支持分页参数" do
      result = UserResource.list({ page: 2, per_page: 2 })
      props = result.to_inertia

      expect(props[:pagination][:page]).to eq(2)
      expect(props[:data].length).to eq(1) # 第二页只有 1 个用户
    end

    it "支持排序" do
      result = UserResource.list({ sort: "email", sort_dir: "desc" })
      props = result.to_inertia

      emails = props[:data].map { |u| u[:email] }
      expect(emails).to eq(["test3@example.com", "test2@example.com", "test1@example.com"])
    end

    it "支持搜索" do
      result = UserResource.list({ search: "test1" })
      props = result.to_inertia

      expect(props[:data].length).to eq(1)
      expect(props[:data].first[:email]).to eq("test1@example.com")
    end

    it "不返回密码字段" do
      result = UserResource.list({})
      props = result.to_inertia

      props[:data].each do |user|
        expect(user).not_to have_key(:password_digest)
        expect(user).not_to have_key(:password)
      end
    end

    it "合并额外的 meta 参数" do
      result = UserResource.list({})
      roles = [{ name: "admin" }, { name: "user" }]
      props = result.to_inertia(meta: { roles: roles })

      expect(props[:roles]).to eq(roles)
      expect(props[:pagination]).to be_present
    end
  end
end
