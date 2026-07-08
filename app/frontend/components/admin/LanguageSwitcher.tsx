import { Dropdown, Tooltip } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { usePage } from '@inertiajs/react'
import { useEffect } from 'react'

const languages = [
  { key: 'zh-CN', label: '中文' },
  { key: 'en', label: 'English' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const { user } = usePage().props as any

  // 首次加载时，从后端 user.locale 同步语言（覆盖 localStorage）
  useEffect(() => {
    if (user?.locale && user.locale !== i18n.language) {
      void i18n.changeLanguage(user.locale)
      localStorage.setItem('locale', user.locale)
    }
  }, [user?.locale])

  const handleChange = (lang: string) => {
    void i18n.changeLanguage(lang)
    localStorage.setItem('locale', lang)

    // 同步到后端 User.locale
    void fetch('/admin/profile/locale', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
      },
      body: JSON.stringify({ locale: lang }),
    }).catch(() => {
      // 静默失败，不影响用户体验
    })
  }

  const currentLang = languages.find((l) => l.key === i18n.language) || languages[0]

  return (
    <Dropdown
      menu={{
        items: languages.map((l) => ({
          key: l.key,
          label: l.label,
          onClick: () => handleChange(l.key),
        })),
        selectedKeys: [i18n.language],
      }}
    >
      <Tooltip title={currentLang.label}>
        <span style={{ display: 'inline-flex', cursor: 'pointer', alignItems: 'center' }}>
          <GlobalOutlined style={{ fontSize: 16 }} />
        </span>
      </Tooltip>
    </Dropdown>
  )
}
