# frozen_string_literal: true

# 翻译服务：合并静态 locale 文件和数据库字典
class TranslationService
  CACHE_KEY_PREFIX = "translations:"
  CACHE_TTL = 1.hour

  class << self
    # 获取合并后的翻译数据
    # 静态文件作为基础，数据库字典覆盖/扩展
    def merged_translations(locale)
      Rails.cache.fetch(cache_key(locale), expires_in: CACHE_TTL) do
        static = load_static_translations(locale)
        dynamic = load_database_translations(locale)
        deep_merge(static, dynamic)
      end
    end

    # 清除所有翻译缓存
    def clear_cache!
      available_locales.each do |locale|
        Rails.cache.delete(cache_key(locale))
      end
    end

    # 获取所有可用的语言
    def available_locales
      # 从数据库 translations 字段中提取所有语言
      Dictionary.pluck(:translations).flat_map(&:keys).uniq.sort
    end

    private

    def cache_key(locale)
      "#{CACHE_KEY_PREFIX}#{locale}"
    end

    # 从静态 JSON 文件加载翻译
    def load_static_translations(locale)
      file_path = Rails.root.join("app", "frontend", "locales", "#{locale}.json")
      return {} unless File.exist?(file_path)

      JSON.parse(File.read(file_path))
    rescue JSON::ParserError
      {}
    end

    # 从数据库加载翻译
    def load_database_translations(locale)
      records = Dictionary.all
      Dictionary.to_nested_hash(records, locale)
    end

    # 深度合并两个 hash（第二个覆盖第一个）
    def deep_merge(hash1, hash2)
      hash1.merge(hash2) do |_key, val1, val2|
        if val1.is_a?(Hash) && val2.is_a?(Hash)
          deep_merge(val1, val2)
        else
          val2
        end
      end
    end
  end
end
