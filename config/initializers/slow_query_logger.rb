# frozen_string_literal: true

# 生产环境慢查询日志
# 记录执行时间超过阈值的 SQL 查询
if Rails.env.production?
  SLOW_QUERY_THRESHOLD_MS = (ENV.fetch("SLOW_QUERY_THRESHOLD_MS", 200)).to_f

  ActiveSupport::Notifications.subscribe("sql.active_record") do |_name, start, finish, _id, payload|
    duration_ms = (finish - start) * 1000.0
    next if duration_ms < SLOW_QUERY_THRESHOLD_MS
    next if payload[:name] == "SCHEMA" || payload[:name]&.include?("ActiveRecord::SchemaMigration")

    Rails.logger.warn({
      event: "slow_query",
      sql: payload[:sql],
      duration_ms: duration_ms.round(2),
      name: payload[:name],
      statement_name: payload[:statement_name]
    }.to_json)
  end
end
