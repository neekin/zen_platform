class AddFieldPermissionsToPermissions < ActiveRecord::Migration[8.1]
  def change
    add_column :permissions, :field_name, :string
    add_column :permissions, :field_action, :string
    add_index :permissions, [:role_name, :resource, :field_name], unique: true, name: 'index_permissions_on_role_resource_field'
  end
end
