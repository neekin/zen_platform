class CreatePermissions < ActiveRecord::Migration[8.1]
  def change
    create_table :permissions do |t|
      t.string :role_name, null: false
      t.string :resource, null: false
      t.string :action_name, null: false
      t.boolean :allowed, default: true

      t.timestamps
    end

    add_index :permissions, [ :role_name, :resource, :action_name ], unique: true, name: 'idx_permissions_role_resource_action'
    add_index :permissions, :role_name
  end
end
