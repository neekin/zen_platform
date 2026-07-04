# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create default roles
%w[super_admin admin editor viewer].each do |role_name|
  Role.find_or_create_by(name: role_name)
end

# Create admin user
admin = User.find_or_initialize_by(email: "admin@example.com")
admin.update!(
  username: "admin",
  password: "password123",
  name: "Admin",
)
admin.add_role(:super_admin) unless admin.has_role?(:super_admin)

# Create demo categories
categories = ["技术博客", "产品更新", "行业资讯"].map do |name|
  Category.find_or_create_by!(name: name)
end

# Create demo articles
10.times do |i|
  Article.find_or_create_by!(title: "示例文章 #{i + 1}") do |a|
    a.body = "{\"root\":{\"children\":[{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"这是第 #{i + 1} 篇示例文章的内容。\",\"type\":\"text\",\"version\":1}],\"direction\":\"ltr\",\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1}],\"direction\":\"ltr\",\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}"
    a.status = %w[draft published archived].sample
    a.category = categories.sample
    a.is_featured = [true, false].sample
  end
end

# Create demo tasks
5.times do |i|
  Task.find_or_create_by!(title: "示例任务 #{i + 1}") do |t|
    t.description = "这是第 #{i + 1} 个示例任务的描述"
    t.status = %w[todo doing done].sample
    t.position = i
    t.user = admin
  end
end

# Create demo products
5.times do |i|
  Product.find_or_create_by!(name: "示例产品 #{i + 1}") do |p|
    p.price = rand(10..999)
    p.description = "这是第 #{i + 1} 个示例产品的描述"
    p.status = %w[active inactive].sample
  end
end

puts "Seed data created: #{Article.count} articles, #{Task.count} tasks, #{Product.count} products"
