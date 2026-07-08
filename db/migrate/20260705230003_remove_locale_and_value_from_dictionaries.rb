class RemoveLocaleAndValueFromDictionaries < ActiveRecord::Migration[8.0]
  def change
    remove_index :dictionaries, column: [:locale, :key] if index_exists?(:dictionaries, [:locale, :key])
    remove_index :dictionaries, column: [:locale, :group] if index_exists?(:dictionaries, [:locale, :group])
    
    remove_column :dictionaries, :locale, :string
    remove_column :dictionaries, :value, :text
    
    # 添加新的唯一索引（按 key）
    add_index :dictionaries, :key, unique: true
  end
end
