# frozen_string_literal: true

class ApiKey < ApplicationRecord
  belongs_to :user

  validates :key, presence: true, uniqueness: true
  validates :name, presence: true

  before_validation :generate_key, on: :create

  scope :active, -> { where("expires_at IS NULL OR expires_at > ?", Time.current) }

  def expired?
    expires_at.present? && expires_at <= Time.current
  end

  private

  def generate_key
    self.key ||= SecureRandom.hex(32)
  end
end
