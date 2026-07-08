# frozen_string_literal: true

require "rails_helper"

RSpec.describe NotificationService, type: :service do
  let(:recipient) { User.create!(username: "recip", email: "recip@test.com", name: "Recipient", password: "pass123") }
  let(:actor) { User.create!(username: "actor", email: "actor@test.com", name: "Actor", password: "pass123") }

  # 测试前确保 broadcast 失败不会影响测试（ActionCable 在测试环境可能不可用）
  before do
    allow(NotificationService).to receive(:broadcast).and_return(nil)
  end

  describe ".notify" do
    it "creates a notification record" do
      expect {
        described_class.notify(recipient: recipient, actor: actor, action: "published")
      }.to change(Notification, :count).by(1)
    end

    it "sets correct attributes" do
      notification = described_class.notify(recipient: recipient, actor: actor, action: "updated")
      expect(notification.recipient).to eq(recipient)
      expect(notification.actor).to eq(actor)
      expect(notification.action).to eq("updated")
      expect(notification.read).to be false
    end

    it "stores metadata as JSON" do
      notification = described_class.notify(
        recipient: recipient,
        action: "export_ready",
        metadata: { format: "csv", resource: "User" }
      )
      expect(notification.metadata).to be_present
      parsed = JSON.parse(notification.metadata)
      expect(parsed["format"]).to eq("csv")
    end

    it "accepts symbol action" do
      notification = described_class.notify(recipient: recipient, action: :created)
      expect(notification.action).to eq("created")
    end

    it "works without actor (system notification)" do
      notification = described_class.notify(recipient: recipient, action: "system_alert")
      expect(notification.actor).to be_nil
      expect(notification.action).to eq("system_alert")
    end

    it "works without notifiable" do
      notification = described_class.notify(recipient: recipient, action: "ping")
      expect(notification.notifiable).to be_nil
    end
  end

  describe ".notify_users" do
    let(:user2) { User.create!(username: "u2", email: "u2@test.com", name: "U2", password: "pass123") }
    let(:user3) { User.create!(username: "u3", email: "u3@test.com", name: "U3", password: "pass123") }

    it "creates a notification for each recipient" do
      expect {
        described_class.notify_users(recipients: [ user2, user3 ], action: "announcement")
      }.to change(Notification, :count).by(2)
    end

    it "deduplicates by user id" do
      expect {
        described_class.notify_users(recipients: [ user2, user2, user3 ], action: "announcement")
      }.to change(Notification, :count).by(2)
    end

    it "returns array of notifications" do
      result = described_class.notify_users(recipients: [ user2, user3 ], action: "ping")
      expect(result).to be_an(Array)
      expect(result.size).to eq(2)
    end

    it "accepts a single user (non-array)" do
      expect {
        described_class.notify_users(recipients: user2, action: "ping")
      }.to change(Notification, :count).by(1)
    end
  end

  describe ".notify_role" do
    let(:role) { Role.find_or_create_by!(name: "editor") }
    let!(:editor1) { User.create!(username: "ed1", email: "ed1@test.com", name: "Ed1", password: "pass123") }
    let!(:editor2) { User.create!(username: "ed2", email: "ed2@test.com", name: "Ed2", password: "pass123") }

    before do
      editor1.add_role("editor")
      editor2.add_role("editor")
    end

    it "notifies all users with the given role" do
      expect {
        described_class.notify_role("editor", action: "release")
      }.to change(Notification, :count).by(2)
    end

    it "accepts symbol role name" do
      expect {
        described_class.notify_role(:editor, action: "release")
      }.to change(Notification, :count).by(2)
    end

    it "notifies nobody if role has no users" do
      expect {
        described_class.notify_role("nonexistent", action: "x")
      }.to change(Notification, :count).by(0)
    end
  end

  describe ".notify_roles" do
    let!(:admin_user) { User.create!(username: "adm", email: "adm@test.com", name: "Adm", password: "pass123") }
    let!(:multi_role_user) { User.create!(username: "multi", email: "multi@test.com", name: "Multi", password: "pass123") }

    before do
      admin_user.add_role("admin")
      multi_role_user.add_role("admin")
      multi_role_user.add_role("editor")
    end

    it "notifies users in any of the roles" do
      expect {
        described_class.notify_roles([ "admin", "editor" ], action: "broadcast")
      }.to change(Notification, :count).by(2)
    end

    it "deduplicates users with multiple matching roles" do
      # multi_role_user 有 admin + editor 两个角色，应该只收到一条
      described_class.notify_roles([ "admin", "editor" ], action: "broadcast")
      multi_notifs = Notification.where(recipient: multi_role_user)
      expect(multi_notifs.count).to eq(1)
    end

    it "accepts single role name as string" do
      expect {
        described_class.notify_roles("admin", action: "x")
      }.to change(Notification, :count).by(2)
    end
  end

  describe ".notify_admins" do
    let!(:super_admin) { User.create!(username: "sa", email: "sa@test.com", name: "SA", password: "pass123") }
    let!(:admin) { User.create!(username: "ad", email: "ad@test.com", name: "AD", password: "pass123") }
    let!(:viewer) { User.create!(username: "vw", email: "vw@test.com", name: "VW", password: "pass123") }

    before do
      super_admin.add_role("super_admin")
      admin.add_role("admin")
      viewer.add_role("viewer")
    end

    it "notifies super_admin and admin users" do
      expect {
        described_class.notify_admins(action: "security_alert")
      }.to change(Notification, :count).by(2)
    end

    it "does not notify non-admin users" do
      described_class.notify_admins(action: "security_alert")
      expect(Notification.where(recipient: viewer).count).to eq(0)
    end
  end

  describe ".notify_all" do
    let!(:u1) { User.create!(username: "a1", email: "a1@test.com", name: "A1", password: "pass123") }
    let!(:u2) { User.create!(username: "a2", email: "a2@test.com", name: "A2", password: "pass123") }

    it "notifies every user" do
      count = User.count
      expect {
        described_class.notify_all(action: "maintenance")
      }.to change(Notification, :count).by(count)
    end
  end

  describe ".notify_all_except" do
    let!(:u1) { User.create!(username: "e1", email: "e1@test.com", name: "E1", password: "pass123") }
    let!(:u2) { User.create!(username: "e2", email: "e2@test.com", name: "E2", password: "pass123") }
    let!(:u3) { User.create!(username: "e3", email: "e3@test.com", name: "E3", password: "pass123") }

    it "excludes the given user" do
      described_class.notify_all_except(u1, action: "login")
      expect(Notification.where(recipient: u1).count).to eq(0)
    end

    it "notifies all other users" do
      expect {
        described_class.notify_all_except(u1, action: "login")
      }.to change(Notification, :count).by(User.count - 1)
    end

    it "accepts array of excluded users" do
      expect {
        described_class.notify_all_except([ u1, u2 ], action: "login")
      }.to change(Notification, :count).by(User.count - 2)
    end
  end
end
