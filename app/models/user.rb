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

  def self.find_by_account(account)
    find_by("email = :q OR username = :q", q: account)
  end
end
