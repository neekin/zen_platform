import { useCallback, useEffect, useRef, useState } from 'react'
import { Select, Spin, Avatar, Space } from 'antd'
import type { SelectProps } from 'antd'

export interface DebounceSelectProps<ValueType = any>
  extends Omit<SelectProps<ValueType | ValueType[]>, 'options' | 'children'> {
  fetchOptions: (search: string) => Promise<ValueType[]>
  debounceTimeout?: number
  showAvatar?: boolean
  defaultOptions?: ValueType[]
}

export interface DefaultOptionType {
  value: number
  label: string
  avatar?: string
}

function useDebounceFn<T extends (...args: any[]) => any>(fn: T, delay: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        fn(...args)
      }, delay)
    },
    [fn, delay]
  )
}

function DebounceSelect<
  ValueType extends DefaultOptionType = DefaultOptionType
>({
  fetchOptions,
  debounceTimeout = 500,
  showAvatar = false,
  defaultOptions = [],
  ...props
}: DebounceSelectProps<ValueType>) {
  const [fetching, setFetching] = useState(false)
  const [options, setOptions] = useState<ValueType[]>(defaultOptions)
  const fetchRef = useRef(0)

  const loadOptions = useCallback(
    (value: string) => {
      fetchRef.current += 1
      const fetchId = fetchRef.current
      setFetching(true)

      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          return
        }
        // 合并 defaultOptions，确保编辑模式回显的值始终在选项中
        const merged = [...defaultOptions]
        for (const opt of newOptions) {
          if (!merged.some((d) => d.value === opt.value)) {
            merged.push(opt)
          }
        }
        setOptions(merged)
        setFetching(false)
      })
    },
    [fetchOptions, defaultOptions]
  )

  const debounceFetcher = useDebounceFn(loadOptions, debounceTimeout)

  // 下拉框打开时自动加载初始数据
  const handleDropdownVisibleChange = useCallback(
    (open: boolean) => {
      if (open) {
        loadOptions('')
      }
      props.onDropdownVisibleChange?.(open)
    },
    [loadOptions, props.onDropdownVisibleChange]
  )

  // 组件挂载时加载初始数据（确保编辑模式回显正确）
  useEffect(() => {
    loadOptions('')
  }, [])

  const optionRender = useCallback(
    (option: any) => {
      const opt = option.data as ValueType
      return (
        <Space>
          {showAvatar && opt.avatar && (
            <Avatar size="small" src={opt.avatar} />
          )}
          <span>{opt.label}</span>
        </Space>
      )
    },
    [showAvatar]
  )

  return (
    <Select
      showSearch
      filterOption={false}
      onSearch={debounceFetcher}
      onDropdownVisibleChange={handleDropdownVisibleChange}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      options={options}
      optionRender={showAvatar ? optionRender : undefined}
      {...props}
    />
  )
}

export default DebounceSelect
