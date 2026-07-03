# frozen_string_literal: true

require "rails_helper"

RSpec.describe ApplicationPolicy, type: :policy do
  let(:super_admin) { User.create!(username: "sa", email: "sa@test.com", name: "SA", password: "pass123").tap { |u| u.add_role(:super_admin) } }
  let(:admin) { User.create!(username: "adm", email: "adm@test.com", name: "Admin", password: "pass123").tap { |u| u.add_role(:admin) } }
  let(:editor) { User.create!(username: "ed", email: "ed@test.com", name: "Editor", password: "pass123").tap { |u| u.add_role(:editor) } }
  let(:viewer) { User.create!(username: "vw", email: "vw@test.com", name: "Viewer", password: "pass123").tap { |u| u.add_role(:viewer) } }
  let(:no_role) { User.create!(username: "nr", email: "nr@test.com", name: "NoRole", password: "pass123") }
  let(:record) { Article.create!(title: "Test", body: "Content") }

  describe "#index?" do
    it "allows all roles" do
      [super_admin, admin, editor, viewer].each do |user|
        expect(ApplicationPolicy.new(user, record).index?).to be true
      end
    end

    it "denies users without roles" do
      expect(ApplicationPolicy.new(no_role, record).index?).to be false
    end
  end

  describe "#create?" do
    it "allows super_admin, admin, editor" do
      [super_admin, admin, editor].each do |user|
        expect(ApplicationPolicy.new(user, record).create?).to be true
      end
    end

    it "denies viewer and no_role" do
      [viewer, no_role].each do |user|
        expect(ApplicationPolicy.new(user, record).create?).to be false
      end
    end
  end

  describe "#destroy?" do
    it "allows super_admin and admin" do
      [super_admin, admin].each do |user|
        expect(ApplicationPolicy.new(user, record).destroy?).to be true
      end
    end

    it "denies editor and viewer" do
      [editor, viewer].each do |user|
        expect(ApplicationPolicy.new(user, record).destroy?).to be false
      end
    end
  end
end
