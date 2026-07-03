# frozen_string_literal: true

require "rails_helper"

RSpec.describe NotificationService, type: :service do
  let(:recipient) { User.create!(username: "recip", email: "recip@test.com", name: "Recipient", password: "pass123") }
  let(:actor) { User.create!(username: "actor", email: "actor@test.com", name: "Actor", password: "pass123") }

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

    it "stores metadata" do
      notification = described_class.notify(
        recipient: recipient,
        action: "export_ready",
        metadata: { format: "csv", resource: "Article" }
      )
      expect(notification.metadata).to be_present
    end
  end
end
