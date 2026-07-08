# frozen_string_literal: true

require "rails_helper"

RSpec.describe Zen::Resource::QueryBuilder do
  let(:resource_class) do
    Class.new(Zen::Resource) do
      model User

      attribute :id, :integer
      attribute :email, :string, searchable: true
      attribute :name, :string, searchable: true
      attribute :username, :string, searchable: true
      attribute :phone, :string, searchable: true

      paginate per_page: 10, max_per_page: 50
      sortable :created_at, :email, :name
    end
  end

  let(:builder) { described_class.new(resource_class) }

  def create_user(attrs = {})
    unique = SecureRandom.hex(6)
    defaults = {
      email: "#{unique}@example.com",
      username: "user_#{unique}",
      name: "User #{unique}",
      password: "password123"
    }
    User.create!(defaults.merge(attrs))
  end

  describe "#build" do
    context "with pagination" do
      it "returns paginated results" do
        15.times { create_user }

        result = builder.build({ page: 1, per_page: 5 })

        expect(result[:records].size).to eq(5)
        expect(result[:meta][:page]).to eq(1)
        expect(result[:meta][:per_page]).to eq(5)
        expect(result[:meta][:total]).to eq(15)
        expect(result[:meta][:total_pages]).to eq(3)
      end

      it "respects max_per_page limit" do
        5.times { create_user }

        result = builder.build({ page: 1, per_page: 100 })

        expect(result[:records].size).to eq(5)
        expect(result[:meta][:per_page]).to eq(50)
      end

      it "uses default per_page when not specified" do
        15.times { create_user }

        result = builder.build({ page: 1 })

        expect(result[:meta][:per_page]).to eq(10)
      end

      it "returns all records when pagination is disabled" do
        resource_class_no_pagination = Class.new(Zen::Resource) do
          model User
          attribute :id, :integer
        end

        builder_no_pagination = described_class.new(resource_class_no_pagination)
        5.times { create_user }

        result = builder_no_pagination.build({})

        expect(result[:records].size).to eq(User.count)
        expect(result[:meta]).to eq({})
      end
    end

    context "with search" do
      it "filters records by searchable fields" do
        user1 = create_user(email: "test@example.com", name: "Test User")
        _user2 = create_user(email: "other@example.com", name: "Other User")
        user3 = create_user(email: "test2@example.com", name: "Another Test")

        result = builder.build({ search: "test" })

        ids = result[:records].map(&:id)
        expect(ids).to include(user1.id, user3.id)
        expect(ids).not_to include(_user2.id)
      end

      it "searches across multiple searchable fields" do
        user1 = create_user(email: "test@example.com", name: "Regular User")
        user2 = create_user(email: "regular@example.com", name: "Test User")

        result = builder.build({ search: "test" })

        ids = result[:records].map(&:id)
        expect(ids).to include(user1.id, user2.id)
      end

      it "returns empty when no matches" do
        create_user(email: "test@example.com", name: "Test User")

        result = builder.build({ search: "zzz_nonexistent_zzz" })

        expect(result[:records]).to be_empty
      end

      it "ignores search when no searchable fields are configured" do
        resource_class_no_search = Class.new(Zen::Resource) do
          model User
          attribute :id, :integer
          attribute :email, :string
        end

        builder_no_search = described_class.new(resource_class_no_search)
        user = create_user

        result = builder_no_search.build({ search: "zzz_nonexistent_zzz" })

        ids = result[:records].map(&:id)
        expect(ids).to include(user.id)
      end
    end

    context "with filters" do
      it "filters by exact field match" do
        user1 = create_user(email: "match@example.com")
        _user2 = create_user(email: "nomatch@example.com")

        result = builder.build({ filter: { email: "match@example.com" } })

        ids = result[:records].map(&:id)
        expect(ids).to eq([user1.id])
      end

      it "filters by multiple fields" do
        user1 = create_user(email: "combo_a@example.com", name: "Combo Match")
        _user2 = create_user(email: "combo_b@example.com", name: "Combo Match")
        _user3 = create_user(email: "combo_c@example.com", name: "Different")

        result = builder.build({ filter: { email: "combo_a@example.com", name: "Combo Match" } })

        expect(result[:records].map(&:id)).to eq([user1.id])
      end

      it "ignores blank filter values" do
        user1 = create_user(email: "one@example.com")
        user2 = create_user(email: "two@example.com")

        result = builder.build({ filter: { email: "" } })

        ids = result[:records].map(&:id)
        expect(ids).to include(user1.id, user2.id)
      end

      it "ignores non-existent columns" do
        user1 = create_user

        result = builder.build({ filter: { non_existent_column: "value" } })

        ids = result[:records].map(&:id)
        expect(ids).to include(user1.id)
      end

      it "ignores non-hash filters" do
        user1 = create_user

        result = builder.build({ filter: "invalid" })

        ids = result[:records].map(&:id)
        expect(ids).to include(user1.id)
      end
    end

    context "with sorting" do
      it "sorts by allowed fields ascending" do
        create_user(email: "b_sort@example.com")
        create_user(email: "a_sort@example.com")
        create_user(email: "c_sort@example.com")

        result = builder.build({ sort: "email", sort_dir: "asc" })

        emails = result[:records].map(&:email).select { |e| e.include?("_sort") }
        expect(emails).to eq(%w[a_sort@example.com b_sort@example.com c_sort@example.com])
      end

      it "sorts by allowed fields descending" do
        create_user(email: "b_desc@example.com")
        create_user(email: "a_desc@example.com")
        create_user(email: "c_desc@example.com")

        result = builder.build({ sort: "email", sort_dir: "desc" })

        emails = result[:records].map(&:email).select { |e| e.include?("_desc") }
        expect(emails).to eq(%w[c_desc@example.com b_desc@example.com a_desc@example.com])
      end

      it "defaults to ascending when direction not specified" do
        create_user(email: "b_noasc@example.com")
        create_user(email: "a_noasc@example.com")

        result = builder.build({ sort: "email" })

        emails = result[:records].map(&:email).select { |e| e.include?("_noasc") }
        expect(emails).to eq(%w[a_noasc@example.com b_noasc@example.com])
      end

      it "ignores sorting by non-allowed fields" do
        user1 = create_user(email: "x_ignore@example.com")
        user2 = create_user(email: "y_ignore@example.com")

        result = builder.build({ sort: "id", sort_dir: "desc" })

        ids = result[:records].map(&:id)
        expect(ids).to include(user1.id, user2.id)
      end

      it "defaults to ascending for invalid sort direction" do
        create_user(email: "b_baddir@example.com")
        create_user(email: "a_baddir@example.com")

        result = builder.build({ sort: "email", sort_dir: "invalid" })

        emails = result[:records].map(&:email).select { |e| e.include?("_baddir") }
        expect(emails).to eq(%w[a_baddir@example.com b_baddir@example.com])
      end

      it "ignores blank sort field" do
        user1 = create_user(email: "blank_sort@example.com")

        result = builder.build({ sort: "" })

        ids = result[:records].map(&:id)
        expect(ids).to include(user1.id)
      end
    end

    context "with combined options" do
      it "applies search, filter, sort, and pagination together" do
        create_user(email: "alpha_combined@example.com", name: "Test Alpha")
        create_user(email: "beta_combined@example.com", name: "Test Beta")
        create_user(email: "gamma_combined@example.com", name: "Other Gamma")
        create_user(email: "delta_combined@example.com", name: "Test Delta")

        result = builder.build({
          search: "test",
          filter: { email: "alpha_combined@example.com" },
          sort: "email",
          sort_dir: "desc",
          page: 1,
          per_page: 10
        })

        expect(result[:records].size).to eq(1)
        expect(result[:records].first.email).to eq("alpha_combined@example.com")
        expect(result[:meta][:total]).to eq(1)
      end
    end

    context "with cursor pagination" do
      it "returns cursor-based results when cursor is provided" do
        users = 15.times.map { |i| create_user(email: "cursor_#{i.to_s.rjust(3, '0')}@example.com") }

        result = builder.build({
          cursor: nil,
          per_page: 5,
          sort: "id",
          sort_dir: "asc"
        })

        expect(result[:records].size).to eq(5)
        expect(result[:meta][:pagination_type]).to eq("cursor")
        expect(result[:meta][:has_more]).to be true
        expect(result[:meta][:next_cursor]).to eq(users[4].id)
      end

      it "loads next page using cursor" do
        users = 15.times.map { |i| create_user(email: "cursor_#{i.to_s.rjust(3, '0')}@example.com") }

        result = builder.build({
          cursor: users[4].id,
          cursor_direction: "after",
          per_page: 5,
          sort: "id",
          sort_dir: "asc"
        })

        expect(result[:records].size).to eq(5)
        expect(result[:records].map(&:id)).to eq(users[5..9].map(&:id))
        expect(result[:meta][:has_more]).to be true
        expect(result[:meta][:next_cursor]).to eq(users[9].id)
      end

      it "returns has_more false on last page" do
        users = 8.times.map { |i| create_user(email: "cursor_#{i.to_s.rjust(3, '0')}@example.com") }

        result = builder.build({
          cursor: users[4].id,
          cursor_direction: "after",
          per_page: 5,
          sort: "id",
          sort_dir: "asc"
        })

        expect(result[:records].size).to eq(3)
        expect(result[:meta][:has_more]).to be false
        expect(result[:meta][:next_cursor]).to be_nil
      end

      it "supports custom sort fields" do
        create_user(email: "b_cursor@example.com")
        create_user(email: "a_cursor@example.com")
        create_user(email: "c_cursor@example.com")

        result = builder.build({
          cursor: nil,
          per_page: 10,
          sort: "email",
          sort_dir: "asc"
        })

        emails = result[:records].map(&:email).select { |e| e.include?("_cursor") }
        expect(emails).to eq(%w[a_cursor@example.com b_cursor@example.com c_cursor@example.com])
      end

      it "falls back to id for non-sortable fields" do
        create_user(email: "cursor_test@example.com")

        result = builder.build({
          cursor: nil,
          per_page: 10,
          sort: "non_existent",
          sort_dir: "asc"
        })

        expect(result[:records]).not_to be_empty
      end

      it "falls back to offset pagination when cursor is blank" do
        12.times { create_user }

        result = builder.build({
          cursor: "",
          page: 1,
          per_page: 5
        })

        expect(result[:meta][:pagination_type]).to eq("offset")
        expect(result[:meta][:page]).to eq(1)
      end
    end

    context "with custom scope" do
      it "uses provided scope as base query" do
        user1 = create_user(phone: "111")
        _user2 = create_user(phone: "222")
        user3 = create_user(phone: "111")

        scope = User.where(phone: "111")
        result = builder.build({}, scope: scope)

        ids = result[:records].map(&:id)
        expect(ids).to include(user1.id, user3.id)
        expect(ids).not_to include(_user2.id)
      end

      it "combines scope with other options" do
        user1 = create_user(email: "scope_combo@example.com", name: "Scoped Test")
        _user2 = create_user(email: "scope_other@example.com", name: "Scoped Test")
        _user3 = create_user(email: "scope_diff@example.com", name: "Different")

        scope = User.where(name: "Scoped Test")
        result = builder.build({ filter: { email: "scope_combo@example.com" } }, scope: scope)

        expect(result[:records].map(&:id)).to eq([user1.id])
      end
    end

    context "with eager loading (includes)" do
      it "applies resource-level default_includes" do
        resource_with_includes = Class.new(Zen::Resource) do
          model User
          attribute :id, :integer
          includes :notifications
        end

        builder_with_includes = described_class.new(resource_with_includes)
        user = create_user

        # 通过 query spy 验证 includes 被调用
        relation = User.all
        allow(User).to receive(:all).and_return(relation)
        expect(relation).to receive(:includes).with(:notifications).and_call_original

        builder_with_includes.build({})
      end

      it "applies includes passed via build parameter" do
        user = create_user
        relation = User.all
        allow(User).to receive(:all).and_return(relation)
        expect(relation).to receive(:includes).with(:api_keys).and_call_original

        builder.build({}, includes: [:api_keys])
      end

      it "merges resource-level and build-level includes" do
        resource_with_includes = Class.new(Zen::Resource) do
          model User
          attribute :id, :integer
          includes :notifications
        end

        builder_with_includes = described_class.new(resource_with_includes)
        user = create_user

        relation = User.all
        allow(User).to receive(:all).and_return(relation)
        expect(relation).to receive(:includes).with(:notifications, :api_keys).and_call_original

        builder_with_includes.build({}, includes: [:api_keys])
      end

      it "skips includes when none are configured" do
        user = create_user

        relation = User.all
        allow(User).to receive(:all).and_return(relation)
        expect(relation).not_to receive(:includes)

        builder.build({})
      end
    end
  end
end