import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'

// 从 Inertia 共享数据或 localStorage 获取初始语言
const getInitialLocale = (): string => {
  // 优先使用 localStorage 缓存（用户手动切换后立即生效）
  const cached = localStorage.getItem('locale')
  if (cached && ['zh-CN', 'en'].includes(cached)) return cached

  // 默认中文
  return 'zh-CN'
}

// 从后端 API 获取合并后的翻译数据
async function fetchTranslations(locale: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(`/admin/dictionaries/translations/${locale}`)
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.warn('Failed to fetch translations from API:', error)
  }
  return null
}

// 初始化 i18n，优先使用静态文件，后台加载 API 翻译
void i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': { translation: zhCN },
    en: { translation: en },
  },
  lng: getInitialLocale(),
  fallbackLng: 'zh-CN',
  interpolation: {
    escapeValue: false,
  },
})

// 异步加载 API 翻译并合并
const currentLocale = getInitialLocale()
fetchTranslations(currentLocale).then((apiTranslations) => {
  if (apiTranslations) {
    i18n.addResourceBundle(currentLocale, 'translation', apiTranslations, true, true)
  }
})

// 监听语言切换，自动加载对应翻译
i18n.on('languageChanged', (lng: string) => {
  fetchTranslations(lng).then((apiTranslations) => {
    if (apiTranslations) {
      i18n.addResourceBundle(lng, 'translation', apiTranslations, true, true)
    }
  })
})

export default i18n
