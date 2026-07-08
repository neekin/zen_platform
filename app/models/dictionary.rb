# frozen_string_literal: true

class Dictionary < ApplicationRecord
  validates :key, presence: true, uniqueness: true
  validates :translations, presence: true

  # 按 group 查询
  scope :by_group, ->(group) { where(group: group) }

  # 将字典记录转换为嵌套 hash 结构
  # 例如 key="common.loading" translations={"zh-CN"=>"加载中...", "en"=>"Loading..."}
  # => { "zh-CN" => { "common" => { "loading" => "加载中..." } }, "en" => { "common" => { "loading" => "Loading..." } } }
  def self.to_nested_hash(records, locale)
    result = {}
    records.each do |record|
      keys = record.key.split(".")
      value = record.translations[locale]
      next if value.blank?
      
      current = result
      keys[0...-1].each do |k|
        current[k] ||= {}
        current = current[k]
      end
      current[keys.last] = value
    end
    result
  end
end
