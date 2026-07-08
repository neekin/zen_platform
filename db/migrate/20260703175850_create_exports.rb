class CreateExports < ActiveRecord::Migration[8.1]
  def change
    create_table :exports do |t|
      t.references :user, foreign_key: true
      t.string :format, null: false
      t.string :resource, null: false
      t.text :filters
      t.string :status, default: "pending"
      t.string :file_path
      t.integer :row_count
      t.text :error_message

      t.timestamps
    end

    add_index :exports, :status
  end
end
