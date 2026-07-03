# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

# Create default roles
%w[super_admin admin editor viewer].each do |role_name|
  Role.find_or_create_by(name: role_name)
end

user = User.find_or_initialize_by(email: "admin@example.com")
user.update!(
  username: "admin",
  password: "password123",
  name: "Admin",
)

# Assign super_admin role to first user
user.add_role(:super_admin) unless user.has_role?(:super_admin)
