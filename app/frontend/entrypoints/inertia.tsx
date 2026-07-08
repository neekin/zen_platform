import { createInertiaApp, router } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { App as AntApp, ConfigProvider } from 'antd'
import ErrorBoundary from '../components/ErrorBoundary'
import '../i18n'

NProgress.configure({ showSpinner: false, minimum: 0.2 })

router.on('start', () => NProgress.start())
router.on('finish', () => NProgress.done())

const pages = import.meta.glob('../pages/**/*.tsx', { eager: true })

void createInertiaApp({
  resolve: (name) => {
    const page = (pages as Record<string, any>)[`../pages/${name}.tsx`]
    if (!page) {
      throw new Error(`Page not found: ../pages/${name}.tsx`)
    }
    return page
  },

  setup({ el, App, props }) {
    createRoot(el).render(
      <ErrorBoundary>
        <AntApp>
          <App {...props} />
        </AntApp>
      </ErrorBoundary>
    )
  },

  strictMode: true,

  // 开发环境禁用 history encryption（需要 SSL）
  encryptHistory: window.location.protocol === 'https:',

  defaults: {
    form: {
      forceIndicesArrayFormatInFormData: false,
      withAllErrors: true,
    },
    visitOptions: () => {
      return { queryStringArrayFormat: "brackets" }
    },
  },
}).catch((error) => {
  if (document.getElementById("app")) {
    throw error
  } else {
    console.error(
      "Missing root element.\n\n" +
      "If you see this error, it probably means you loaded Inertia.js on non-Inertia pages.\n" +
      'Consider moving <%= vite_typescript_tag "inertia.tsx" %> to the Inertia-specific layout instead.',
    )
  }
})
