class CreateComments < ActiveRecord::Migration[8.1]
  def change
    create_table :comments do |t|
      t.string :author_name, null: false
      t.text :content, null: false
      t.references :article, foreign_key: true
      t.timestamps
    end
  end
end
