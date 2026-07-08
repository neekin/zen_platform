# frozen_string_literal: true

class CreateWorkflowInstances < ActiveRecord::Migration[8.0]
  def change
    create_table :workflow_instances do |t|
      t.references :workflow_definition, null: false, foreign_key: true
      t.references :initiator, null: false, foreign_key: { to_table: :users }
      t.integer :status, default: 0
      t.json :variables, default: {}
      t.json :current_nodes, default: []
      t.datetime :started_at
      t.datetime :completed_at

      t.timestamps
    end

    add_index :workflow_instances, :status
    add_index :workflow_instances, :started_at
  end
end
