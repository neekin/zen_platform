class AddTranslationsToDictionaries < ActiveRecord::Migration[8.0]
  def change
    add_column :dictionaries, :translations, :json, default: {}
  end
end
