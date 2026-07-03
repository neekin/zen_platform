class CreateTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks do |t|
      t.string :title, null: false
      t.text :description
      t.string :status, default: "todo"
      t.integer :position, default: 0
      t.references :user, foreign_key: true

      t.timestamps
    end
  end
end
