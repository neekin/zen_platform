class AddPhoneAndNoteToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :phone, :string
    add_column :users, :note, :text
  end
end
