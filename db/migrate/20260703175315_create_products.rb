class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products do |t|
      t.string :name, null: false
      t.decimal :price, precision: 10, scale: 2
      t.text :description
      t.string :status, default: "active"

      t.timestamps
    end
  end
end
