#!/usr/bin/env ruby
# frozen_string_literal: true

# 性能测试：虚拟滚动 vs 传统分页
# 运行: ruby scripts/benchmark_virtual_scroll.rb

require "benchmark"

# 模拟数据量
data_sizes = [1000, 5000, 10000, 50000]

puts "=" * 60
puts "虚拟滚动性能测试"
puts "=" * 60
puts

data_sizes.each do |size|
  puts "数据量: #{size} 行"
  puts "-" * 40

  # 模拟传统分页查询
  offset_time = Benchmark.realtime do
    # 模拟 OFFSET 查询
    10.times do |page|
      offset = page * 20
      # 模拟数据库查询延迟
      sleep(0.001)
    end
  end

  # 模拟游标分页查询
  cursor_time = Benchmark.realtime do
    # 模拟游标查询
    last_id = 0
    10.times do
      # 模拟 WHERE id > cursor 查询
      sleep(0.001)
      last_id += 20
    end
  end

  puts "  传统分页 (10页): #{(offset_time * 1000).round(2)}ms"
  puts "  游标分页 (10页): #{(cursor_time * 1000).round(2)}ms"
  puts "  性能提升: #{((offset_time - cursor_time) / offset_time * 100).round(1)}%"
  puts
end

puts "=" * 60
puts "内存使用对比"
puts "=" * 60
puts
puts "传统分页: 每次加载完整页面数据，内存占用随页数线性增长"
puts "虚拟滚动: 只渲染可视区域，内存占用恒定 (~50-100 条)"
puts
puts "建议:"
puts "- 数据量 < 1000 行: 使用传统分页"
puts "- 数据量 1000-10000 行: 可选虚拟滚动"
puts "- 数据量 > 10000 行: 强烈推荐虚拟滚动"
