# frozen_string_literal: true

# Dashboard 实时数据 Channel
#
# 单个 Channel 推送所有实时数据
# 通过 type 字段区分不同数据源：
#   - trend: 用户趋势（30秒）
#   - orders: 订单统计（1分钟）
#   - revenue: 收入统计（5分钟）
#
class DashboardChannel < ApplicationCable::Channel
  def subscribed
    stream_from "dashboard"
  end
end
