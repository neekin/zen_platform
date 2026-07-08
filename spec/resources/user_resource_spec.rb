# frozen_string_literal: true

require "rails_helper"

RSpec.describe UserResource do
  describe "model binding" do
    it "binds to User model" do
      expect(UserResource.model_class).to eq(User)
    end
  end

  describe "attribute definitions" do
    it "defines searchable attributes" do
      expect(UserResource.resource_attributes[:email].required?).to be true
      expect(UserResource.resource_attributes[:email].searchable?).to be true
      expect(UserResource.resource_attributes[:username].required?).to be true
      expect(UserResource.resource_attributes[:username].searchable?).to be true
      expect(UserResource.resource_attributes[:name].required?).to be true
      expect(UserResource.resource_attributes[:name].searchable?).to be true
      expect(UserResource.resource_attributes[:phone].searchable?).to be true
    end

    it "defines id as readonly" do
      expect(UserResource.resource_attributes[:id].readonly?).to be true
    end
  end

  describe "pagination config" do
    it "has correct pagination" do
      expect(UserResource.pagination_config[:per_page]).to eq(20)
      expect(UserResource.pagination_config[:max_per_page]).to eq(100)
    end
  end

  describe "sortable fields" do
    it "includes expected fields" do
      expect(UserResource.sortable_fields).to include(:created_at, :email, :username, :name)
    end
  end

  describe "view configs" do
    it "admin view includes core fields" do
      view = UserResource.view_config(:admin)
      fields = view.resolved_fields(UserResource.resource_attributes)
      expect(fields).to include(:id, :email, :username, :name, :phone)
      expect(fields).not_to include(:password_digest)
    end

    it "api view includes limited fields" do
      view = UserResource.view_config(:api)
      fields = view.resolved_fields(UserResource.resource_attributes)
      expect(fields).to include(:id, :email, :username, :name)
      expect(fields).not_to include(:phone)
    end

    it "api_public view includes only public fields" do
      view = UserResource.view_config(:api_public)
      fields = view.resolved_fields(UserResource.resource_attributes)
      expect(fields).to include(:id, :username, :name)
      expect(fields).not_to include(:email, :phone)
    end
  end
end
