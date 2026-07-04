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

# Initialize default permissions
Permission.seed_defaults!

# === 示例数据 ===
puts "Creating example articles..."

3.times do |i|
  Article.find_or_create_by!(title: "示例文章 #{i + 1}") do |a|
    a.body = "<p>这是第 #{i + 1} 篇示例文章的内容。</p>"
    a.status = i.zero? ? "published" : "draft"
    a.category = ["技术", "产品", "设计"][i % 3]
    a.published_at = i.zero? ? Time.current : nil
    a.user = admin
  end
end

puts "Creating example comments..."

Article.all.each do |article|
  2.times do |i|
    Comment.find_or_create_by!(
      article: article,
      author_name: "评论者 #{i + 1}",
      content: "这是对「#{article.title}」的评论。"
    )
  end
end

puts "Seed data created: #{User.count} users, #{Role.count} roles, #{Permission.count} permissions, #{Article.count} articles, #{Comment.count} comments"
