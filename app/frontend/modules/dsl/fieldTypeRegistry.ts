/**
 * 自定义字段类型注册表
 *
 * 允许开发者注册自定义字段类型，包括表单组件、展示组件、序列化/反序列化
 *
 * @example
 * import { registerFieldType } from '@/modules/dsl'
 *
 * registerFieldType('map', {
 *   FormComponent: MapPicker,
 *   DisplayComponent: MapView,
 *   parse: (value) => JSON.parse(value),
 *   serialize: (value) => JSON.stringify(value),
 * })
 */
import type { ComponentType } from 'react'

/** 字段类型定义 */
export interface FieldTypeDef {
  /** 表单组件（编辑模式） */
  FormComponent: ComponentType<any>
  /** 展示组件（只读模式） */
  DisplayComponent?: ComponentType<any>
  /** 反序列化：存储值 → 组件值 */
  parse?: (value: any) => any
  /** 序列化：组件值 → 存储值 */
  serialize?: (value: any) => any
  /** 列表中的渲染组件（可选，默认使用 DisplayComponent） */
  ColumnComponent?: ComponentType<any>
  /** 是否支持搜索 */
  searchable?: boolean
  /** 默认属性 */
  defaultProps?: Record<string, any>
}

/** 注册表 */
const fieldTypeRegistry = new Map<string, FieldTypeDef>()

/**
 * 注册自定义字段类型
 *
 * @param type 字段类型名称（如 'map', 'color', 'signature'）
 * @param definition 字段类型定义
 */
export function registerFieldType(type: string, definition: FieldTypeDef): void {
  if (fieldTypeRegistry.has(type)) {
    console.warn(`[Zen] Field type "${type}" already registered, overwriting.`)
  }
  fieldTypeRegistry.set(type, definition)
}

/**
 * 获取字段类型定义
 *
 * @param type 字段类型名称
 * @returns 字段类型定义，未注册返回 undefined
 */
export function getFieldType(type: string): FieldTypeDef | undefined {
  return fieldTypeRegistry.get(type)
}

/**
 * 检查字段类型是否已注册
 */
export function hasFieldType(type: string): boolean {
  return fieldTypeRegistry.has(type)
}

/**
 * 获取所有已注册的字段类型
 */
export function getRegisteredFieldTypes(): string[] {
  return Array.from(fieldTypeRegistry.keys())
}

/**
 * 序列化字段值
 *
 * @param type 字段类型
 * @param value 组件值
 * @returns 存储值
 */
export function serializeFieldValue(type: string, value: any): any {
  const def = fieldTypeRegistry.get(type)
  if (def?.serialize) {
    return def.serialize(value)
  }
  return value
}

/**
 * 反序列化字段值
 *
 * @param type 字段类型
 * @param value 存储值
 * @returns 组件值
 */
export function parseFieldValue(type: string, value: any): any {
  const def = fieldTypeRegistry.get(type)
  if (def?.parse) {
    return def.parse(value)
  }
  return value
}
