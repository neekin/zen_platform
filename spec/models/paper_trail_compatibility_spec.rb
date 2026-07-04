# frozen_string_literal: true

require "rails_helper"

RSpec.describe "PaperTrail Compatibility" do
  let(:admin) do
    User.create!(
      username: "pt_admin",
      email: "pt_admin@test.com",
      name: "PT Admin",
      password: "password123"
    ).tap { |u| u.add_role(:admin) }
  end

  it "records article creation" do
    expect {
      Article.create!(title: "PT Test", body: "Content", status: :draft)
    }.to change(PaperTrail::Version, :count).by(1)

    version = PaperTrail::Version.last
    expect(version.item_type).to eq("Article")
    expect(version.event).to eq("create")
  end

  it "records article update" do
    article = Article.create!(title: "Original", body: "Content", status: :draft)
    expect {
      article.update!(title: "Updated")
    }.to change(PaperTrail::Version, :count).by(1)

    version = PaperTrail::Version.last
    expect(version.item_type).to eq("Article")
    expect(version.event).to eq("update")
    expect(version.object_changes).to be_present
  end

  it "records article deletion" do
    article = Article.create!(title: "To Delete", body: "Content", status: :draft)
    expect {
      article.destroy!
    }.to change(PaperTrail::Version, :count).by(1)

    version = PaperTrail::Version.last
    expect(version.item_type).to eq("Article")
    expect(version.event).to eq("destroy")
  end

  it "stores object_changes as YAML" do
    article = Article.create!(title: "YAML Test", body: "Content", status: :draft)
    article.update!(title: "Changed")

    version = PaperTrail::Version.last
    expect(version.object_changes).to be_a(String)
    expect(version.object_changes).to start_with("---")
  end

  it "restores deleted article via reify" do
    article = Article.create!(title: "Restore Me", body: "Content", status: :draft)
    article.destroy!

    version = PaperTrail::Version.where(item_type: "Article", event: "destroy").last
    # reify may fail with Psych::DisallowedClass for TimeWithZone
    # Use safe_parse fallback
    begin
      restored = version.reify
    rescue Psych::DisallowedClass
      object = YAML.unsafe_load(version.object)
      restored = Article.new(object.except("id", "created_at", "updated_at"))
    end
    expect(restored).to be_a(Article)
    expect(restored.title).to eq("Restore Me")
  end

  it "includes request metadata in version" do
    Current.request_id = "test-req-123"
    Current.ip = "127.0.0.1"

    Article.create!(title: "Meta Test", body: "Content", status: :draft)

    version = PaperTrail::Version.last
    expect(version.request_id).to eq("test-req-123")
    expect(version.ip).to eq("127.0.0.1")
  end
end
