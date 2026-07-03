class AddMetadataToVersions < ActiveRecord::Migration[8.1]
  def change
    add_column :versions, :request_id, :string
    add_column :versions, :ip, :string
    add_column :versions, :metadata, :text
    add_index :versions, :request_id
  end
end
