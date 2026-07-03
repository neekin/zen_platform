class CreateNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :notifications do |t|
      t.references :recipient, null: false, foreign_key: { to_table: :users }
      t.references :actor, foreign_key: { to_table: :users }
      t.string :action, null: false
      t.string :notifiable_type
      t.integer :notifiable_id
      t.text :metadata
      t.boolean :read, default: false

      t.timestamps
    end

    add_index :notifications, [:recipient_id, :read]
    add_index :notifications, [:notifiable_type, :notifiable_id]
  end
end
