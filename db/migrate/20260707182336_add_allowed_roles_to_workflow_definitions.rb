class AddAllowedRolesToWorkflowDefinitions < ActiveRecord::Migration[8.1]
  def change
    add_column :workflow_definitions, :allowed_roles, :json
  end
end
