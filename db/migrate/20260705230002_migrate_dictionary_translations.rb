class MigrateDictionaryTranslations < ActiveRecord::Migration[8.0]
  def up
    # 按 key 分组，合并所有 locale 的翻译
    Dictionary.group(:key).each do |record|
      translations = {}
      Dictionary.where(key: record.key).find_each do |dict|
        translations[dict.locale] = dict.value
      end
      
      # 更新第一条记录的 translations 字段
      first_record = Dictionary.find_by(key: record.key)
      first_record.update_columns(translations: translations) if first_record
    end
  end

  def down
    # 回滚：从 translations 字段恢复 locale 和 value
    Dictionary.find_each do |dict|
      next if dict.translations.blank?
      
      dict.translations.each do |locale, value|
        Dictionary.create!(
          locale: locale,
          key: dict.key,
          value: value,
          group: dict.group
        )
      end
    end
  end
end
