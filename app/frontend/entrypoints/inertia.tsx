import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import ErrorBoundary from '../components/ErrorBoundary'

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
        <App {...props} />
      </ErrorBoundary>
    )
  },

  strictMode: true,

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
