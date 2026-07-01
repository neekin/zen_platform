class User < ApplicationRecord
  has_secure_password
  has_many :api_keys, dependent: :destroy

  validates :email, presence: true, uniqueness: true
  validates :username, presence: true, uniqueness: true
  validates :name, presence: true

  def self.find_by_account(account)
    find_by("email = :q OR username = :q", q: account)
  end
end
