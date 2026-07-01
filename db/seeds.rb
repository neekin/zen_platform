# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

user = User.find_or_initialize_by(email: "admin@example.com")
user.update!(
  username: "admin",
  password: "password123",
  name: "Admin",
)
