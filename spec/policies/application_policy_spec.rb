# frozen_string_literal: true

require "rails_helper"

RSpec.describe ApplicationPolicy, type: :policy do
  let(:super_admin) { User.create!(username: "sa", email: "sa@test.com", name: "SA", password: "pass123").tap { |u| u.add_role(:super_admin) } }
  let(:admin) { User.create!(username: "adm", email: "adm@test.com", name: "Admin", password: "pass123").tap { |u| u.add_role(:admin) } }
  let(:editor) { User.create!(username: "ed", email: "ed@test.com", name: "Editor", password: "pass123").tap { |u| u.add_role(:editor) } }
  let(:viewer) { User.create!(username: "vw", email: "vw@test.com", name: "Viewer", password: "pass123").tap { |u| u.add_role(:viewer) } }
  let(:no_role) { User.create!(username: "nr", email: "nr@test.com", name: "NoRole", password: "pass123") }
  let(:record) { User.create!(username: "target", email: "target@test.com", name: "Target", password: "pass123") }

  describe "#index?" do
    it "allows super_admin and admin" do
      [ super_admin, admin ].each do |user|
        expect(ApplicationPolicy.new(user, record).index?).to be true
      end
    end

    it "denies editor, viewer and no_role" do
      [ editor, viewer, no_role ].each do |user|
        expect(ApplicationPolicy.new(user, record).index?).to be false
      end
    end
  end

  describe "#create?" do
    it "allows super_admin only" do
      expect(ApplicationPolicy.new(super_admin, record).create?).to be true
    end

    it "denies admin, editor, viewer and no_role" do
      [ admin, editor, viewer, no_role ].each do |user|
        expect(ApplicationPolicy.new(user, record).create?).to be false
      end
    end
  end

  describe "#destroy?" do
    it "allows super_admin only" do
      expect(ApplicationPolicy.new(super_admin, record).destroy?).to be true
    end

    it "denies admin, editor, viewer and no_role" do
      [ admin, editor, viewer, no_role ].each do |user|
        expect(ApplicationPolicy.new(user, record).destroy?).to be false
      end
    end
  end
end
