class CreateArticles < ActiveRecord::Migration[8.1]
  def change
    create_table :articles do |t|
      t.string :title, null: false
      t.text :body
      t.text :internal_notes
      t.string :status, default: "draft"
      t.string :category
      t.references :user, foreign_key: true
      t.datetime :published_at
      t.timestamps
    end

    add_index :articles, :status
    add_index :articles, :created_at
  end
end
