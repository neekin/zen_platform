class User < ApplicationRecord
  rolify
  has_secure_password
  track_changes
  has_many :api_keys, dependent: :destroy
  has_many :notifications, foreign_key: :recipient_id, dependent: :destroy
  has_many :exports, dependent: :destroy

  validates :email, presence: true, uniqueness: true
  validates :username, presence: true, uniqueness: true
  validates :name, presence: true

  # Zen DSL 配置
  include Zen::ModelDsl

  display do
    list do
      # 分页配置
      paginate per_page: 20, max_per_page: 100

      # 搜索配置
      searchable :email, :username, :name

      # 过滤配置
      filterable :role

      column :email
      column :username
      column :name
      column :role, badge: true
      column :created_at, format: :relative_time
    end
  end

  # Ransack 搜索允许字段（安全考虑，必须明确列出）
  def self.ransackable_attributes(auth_object = nil)
    %w[id email username name created_at updated_at]
  end

  # Ransack 搜索允许关联（可选）
  def self.ransackable_associations(auth_object = nil)
    %w[roles]
  end

  def self.find_by_account(account)
    find_by("email = :q OR username = :q", q: account)
  end
end
