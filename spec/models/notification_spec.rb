# frozen_string_literal: true

require "rails_helper"

RSpec.describe Notification, type: :model do
  let(:user) { User.create!(email: "test@test.com", username: "test", name: "Test", password: "pass") }

  describe "associations" do
    it "belongs to recipient" do
      expect(Notification.reflect_on_association(:recipient).macro).to eq(:belongs_to)
    end

    it "belongs to actor (optional)" do
      assoc = Notification.reflect_on_association(:actor)
      expect(assoc.macro).to eq(:belongs_to)
      expect(assoc.options[:optional]).to be true
    end
  end

  describe "creation" do
    it "creates valid notification" do
      notif = Notification.create!(recipient: user, action: "test")
      expect(notif.persisted?).to be true
      expect(notif.read).to be false
    end
  end

  describe "scopes" do
    let!(:unread) { Notification.create!(recipient: user, action: "unread") }
    let!(:read_notif) { Notification.create!(recipient: user, action: "read", read: true) }

    it ".unread returns unread notifications" do
      expect(Notification.unread).to include(unread)
      expect(Notification.unread).not_to include(read_notif)
    end
  end

  describe "#mark_as_read!" do
    it "marks notification as read" do
      notif = Notification.create!(recipient: user, action: "test")
      notif.mark_as_read!
      expect(notif.read).to be true
    end
  end
end
