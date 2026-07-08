class CreateDictionaries < ActiveRecord::Migration[8.0]
  def change
    create_table :dictionaries do |t|
      t.string :locale, null: false
      t.string :key, null: false
      t.text :value
      t.string :group, default: "default"

      t.timestamps
    end

    add_index :dictionaries, [:locale, :key], unique: true
    add_index :dictionaries, [:locale, :group]
  end
end
