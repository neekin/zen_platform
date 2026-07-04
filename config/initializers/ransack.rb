# frozen_string_literal: true

# Ransack 搜索和过滤配置
# 官方文档：https://activerecord-hackery.github.io/ransack/

# 允许空白查询（默认 false，设为 true 可以搜索空值）
Ransack.configure do |config|
  # 允许使用 LIKE 查询（默认启用）
  # config.add_predicate 'cont', name: 'contain', arel_predicate: 'matches', formatter: proc { |v| "%#{v}%" }

  # 自定义谓词（可选）
  # config.add_predicate 'has_many_numeric', name: 'has_many_numeric', arel_predicate: 'eq', formatter: proc { |v| v }
end
