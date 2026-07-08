# frozen_string_literal: true

class CreateWorkflowDefinitions < ActiveRecord::Migration[8.0]
  def change
    create_table :workflow_definitions do |t|
      t.string :name, null: false
      t.string :key, null: false
      t.text :description
      t.json :bpmn_definition, default: {}
      t.json :form_config, default: {}
      t.integer :version, default: 1
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :workflow_definitions, [:key, :version], unique: true
  end
end
