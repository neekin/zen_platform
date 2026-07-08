class AddAccessTokenToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :access_token, :string
    add_index :users, :access_token, unique: true
  end
end
