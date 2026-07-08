class RemoveApiKeyAndAccessTokenFromUsers < ActiveRecord::Migration[8.1]
  def change
    remove_column :users, :api_key, :integer
    remove_column :users, :access_token, :integer
  end
end
