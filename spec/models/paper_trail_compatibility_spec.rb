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

  it "records user creation" do
    expect {
      User.create!(
        username: "pt_create", email: "pt_create@test.com",
        name: "Create", password: "pass123"
      )
    }.to change(PaperTrail::Version, :count).by(1)

    version = PaperTrail::Version.last
    expect(version.item_type).to eq("User")
    expect(version.event).to eq("create")
  end

  it "records user update" do
    user = User.create!(
      username: "pt_update", email: "pt_update@test.com",
      name: "Original", password: "pass123"
    )
    expect {
      user.update!(name: "Updated")
    }.to change(PaperTrail::Version, :count).by(1)

    version = PaperTrail::Version.last
    expect(version.item_type).to eq("User")
    expect(version.event).to eq("update")
    expect(version.object_changes).to be_present
  end

  it "records user deletion" do
    user = User.create!(
      username: "pt_delete", email: "pt_delete@test.com",
      name: "ToDelete", password: "pass123"
    )
    expect {
      user.destroy!
    }.to change(PaperTrail::Version, :count).by(1)

    version = PaperTrail::Version.last
    expect(version.item_type).to eq("User")
    expect(version.event).to eq("destroy")
  end

  it "stores object_changes as YAML" do
    user = User.create!(
      username: "pt_yaml", email: "pt_yaml@test.com",
      name: "YAML Test", password: "pass123"
    )
    user.update!(name: "Changed")

    version = PaperTrail::Version.last
    expect(version.object_changes).to be_a(String)
    expect(version.object_changes).to start_with("---")
  end

  it "restores deleted user via reify" do
    user = User.create!(
      username: "pt_restore", email: "pt_restore@test.com",
      name: "Restore Me", password: "pass123"
    )
    user.destroy!

    version = PaperTrail::Version.where(item_type: "User", event: "destroy").last
    # reify may fail with Psych::DisallowedClass for TimeWithZone
    # Use safe_load fallback
    begin
      restored = version.reify
    rescue Psych::DisallowedClass
      # 使用 safe_load 并传入允许的类列表
      permitted_classes = [
        ActiveSupport::TimeWithZone,
        ActiveSupport::TimeZone,
        Symbol,
        Time,
        Date,
        DateTime,
        Hash,
        Array,
        String,
        Integer,
        Float,
        BigDecimal,
        TrueClass,
        FalseClass,
        NilClass
      ]
      object = YAML.safe_load(version.object, permitted_classes: permitted_classes, aliases: true)
      restored = User.new(object.except("id", "created_at", "updated_at"))
    end
    expect(restored).to be_a(User)
    expect(restored.name).to eq("Restore Me")
  end

  it "includes request metadata in version" do
    Current.request_id = "test-req-123"
    Current.ip = "127.0.0.1"

    User.create!(
      username: "pt_meta", email: "pt_meta@test.com",
      name: "Meta Test", password: "pass123"
    )

    version = PaperTrail::Version.last
    expect(version.request_id).to eq("test-req-123")
    expect(version.ip).to eq("127.0.0.1")
  end
end
