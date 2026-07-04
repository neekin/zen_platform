import { usePage } from '@inertiajs/react'

interface ZenConfig {
  app_name: string
  logo: string
  primary_color: string
  sidebar_mode: 'side' | 'top' | 'mix'
}

const defaults: ZenConfig = {
  app_name: 'Zen Platform',
  logo: '/logo-mark.svg',
  primary_color: '#D4A537',
  sidebar_mode: 'mix',
}

export function useZenConfig(): ZenConfig {
  const { props } = usePage()
  return (props.zen_config as ZenConfig) || defaults
}
