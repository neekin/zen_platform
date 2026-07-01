class CreateApiKeys < ActiveRecord::Migration[8.1]
  def change
    create_table :api_keys do |t|
      t.references :user, null: false, foreign_key: true
      t.string :key
      t.string :name
      t.datetime :expires_at

      t.timestamps
    end
    add_index :api_keys, :key, unique: true
  end
end
