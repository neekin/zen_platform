# frozen_string_literal: true

class DictionaryResource < Zen::Resource
  model Dictionary

  attribute :id, :integer, readonly: true
  attribute :key, :string, required: true, searchable: true
  attribute :translations, :json, required: true
  attribute :group, :string, searchable: true

  paginate per_page: 50, max_per_page: 200

  sortable :key, :group, :created_at

  view :admin do
    include :id, :key, :translations, :group
    include :created_at, format: :iso8601
    include :updated_at, format: :iso8601
  end
end
