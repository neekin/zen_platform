# frozen_string_literal: true

# === 测试用户数据 ===
puts "创建测试用户..."

test_users = [
  { email: "admin@test1.cn", username: "admin", name: "系统管理员", role: "super_admin" },
  { email: "manager@test1.cn", username: "manager", name: "张经理", role: "admin" },
  { email: "director@test1.cn", username: "director", name: "李总监", role: "admin" },
  { email: "hr@test1.cn", username: "hr", name: "王人事", role: "editor" },
  { email: "finance@test1.cn", username: "finance", name: "赵财务", role: "editor" },
  { email: "employee1@test1.cn", username: "employee1", name: "陈员工", role: "viewer" },
  { email: "employee2@test1.cn", username: "employee2", name: "刘员工", role: "viewer" },
  { email: "employee3@test1.cn", username: "employee3", name: "周员工", role: "viewer" },
]

test_users.each do |u|
  user = User.find_or_initialize_by(email: u[:email])
  if user.new_record?
    user.username = u[:username]
    user.name = u[:name]
    user.password = "password123"
    user.save!
  end
  user.add_role(u[:role]) unless user.has_role?(u[:role])
  puts "  #{u[:name]} (#{u[:role]}) created"
end

puts "测试用户创建完成: #{User.count} users"
