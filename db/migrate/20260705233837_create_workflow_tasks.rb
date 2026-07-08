# frozen_string_literal: true

class CreateWorkflowTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :workflow_tasks do |t|
      t.references :workflow_instance, null: false, foreign_key: true
      t.string :node_id, null: false
      t.string :node_name
      t.integer :task_type, default: 0
      t.references :assignee, foreign_key: { to_table: :users }
      t.json :candidate_users, default: []
      t.json :candidate_roles, default: []
      t.integer :status, default: 0
      t.text :comment
      t.json :form_data, default: {}
      t.datetime :completed_at
      t.datetime :due_date

      t.timestamps
    end

    add_index :workflow_tasks, [:workflow_instance_id, :node_id]
    add_index :workflow_tasks, :status
    add_index :workflow_tasks, :due_date
  end
end
