# frozen_string_literal: true

class UserResource < Zen::Resource
  model User

  # 字段定义（与数据库 schema 一致）
  attribute :id, :integer, readonly: true
  attribute :email, :string, required: true, searchable: true
  attribute :username, :string, required: true, searchable: true
  attribute :name, :string, required: true, searchable: true
  attribute :phone, :string, searchable: true

  # 关联（使用 rolify 的 roles）
  has_many :roles, count_only: true
  has_many :notifications, count_only: true
  has_many :exports, count_only: true

  # 分页
  paginate per_page: 20, max_per_page: 100

  # 排序
  sortable :created_at, :email, :username, :name

  # 视图定义
  view :admin do
    include :id, :email, :username, :name, :phone
    include_association :roles
    include :created_at, format: :iso8601
  end

  view :api do
    include :id, :email, :username, :name
  end

  view :api_public do
    include :id, :username, :name
  end
end
