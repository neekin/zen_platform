# frozen_string_literal: true

require "rails_helper"

RSpec.describe Zen::Resource::Result do
  describe "#to_inertia" do
    it "将分页字段包装到 pagination key 下" do
      meta = {
        page: 1,
        per_page: 20,
        total: 100,
        total_pages: 5,
        pagination_type: "offset"
      }

      result = Zen::Resource::Result.new(data: [{ id: 1 }], meta: meta)
      props = result.to_inertia

      expect(props[:pagination]).to eq({
        page: 1,
        per_page: 20,
        total: 100,
        total_pages: 5,
        pagination_type: "offset"
      })

      expect(props[:page]).to be_nil
      expect(props[:per_page]).to be_nil
      expect(props[:total]).to be_nil
    end

    it "合并额外的 meta 参数" do
      meta = { page: 1, per_page: 20, total: 100 }
      result = Zen::Resource::Result.new(data: [], meta: meta)

      props = result.to_inertia(meta: { roles: [{ name: "admin" }] })

      expect(props[:pagination][:page]).to eq(1)
      expect(props[:roles]).to eq([{ name: "admin" }])
    end

    it "没有分页时不添加 pagination key" do
      result = Zen::Resource::Result.new(data: [], meta: {})
      props = result.to_inertia

      expect(props).not_to have_key(:pagination)
    end

    it "保留非分页的 meta 字段" do
      meta = {
        page: 1,
        per_page: 20,
        total: 100,
        custom_field: "value"
      }

      result = Zen::Resource::Result.new(data: [], meta: meta)
      props = result.to_inertia

      expect(props[:pagination][:page]).to eq(1)
      expect(props[:custom_field]).to eq("value")
    end
  end
end
