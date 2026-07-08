# frozen_string_literal: true

class CreateWorkflowHistories < ActiveRecord::Migration[8.0]
  def change
    create_table :workflow_histories do |t|
      t.references :workflow_instance, null: false, foreign_key: true
      t.string :node_id, null: false
      t.string :node_name
      t.string :node_type
      t.integer :action, default: 0
      t.references :operator, foreign_key: { to_table: :users }
      t.text :comment
      t.json :snapshot, default: {}
      t.datetime :executed_at

      t.timestamps
    end

    add_index :workflow_histories, [:workflow_instance_id, :executed_at]
    add_index :workflow_histories, :action
  end
end
