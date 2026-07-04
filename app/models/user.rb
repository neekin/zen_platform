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
      searchable :email, :username, :name, :phone

      # 过滤配置
      filterable :role

      column :avatar, as: :avatar
      column :email
      column :username
      column :name
      column :phone
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

  # 生成重置密码令牌
  def generate_reset_password_token!
    token = SecureRandom.urlsafe_base64(32)
    update!(
      reset_password_token: Digest::SHA256.hexdigest(token),
      reset_password_sent_at: Time.current
    )
    token
  end

  # 根据令牌查找用户
  def self.find_by_reset_password_token(token)
    return nil if token.blank?

    hashed_token = Digest::SHA256.hexdigest(token)
    find_by(reset_password_token: hashed_token)
  end

  # 重置密码令牌是否过期（2小时）
  def reset_password_expired?
    reset_password_sent_at.blank? || reset_password_sent_at < 2.hours.ago
  end

  # 重置密码
  def reset_password!(new_password)
    result = update(
      password: new_password,
      reset_password_token: nil,
      reset_password_sent_at: nil
    )
    result
  end
end
