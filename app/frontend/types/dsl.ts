// ============================================================
// DSL 元数据类型定义
// 与后端 Zen::ModelDsl#zen_meta 输出的 JSON 结构一一对应
// ============================================================

/** 字段类型 */
export type FieldType =
  | 'string' | 'text' | 'rich_text'
  | 'integer' | 'decimal' | 'float'
  | 'boolean' | 'date' | 'datetime' | 'time'
  | 'enum' | 'image' | 'file' | 'tags'
  | 'json' | 'color' | 'url' | 'email'
  | 'reference'

/** 字段定义 */
export interface FieldDefinition {
  name: string
  type: FieldType
  required: boolean
  default?: string | number | boolean | null
  placeholder?: string | null
  reference: boolean
  target_model?: string | null
  enum_values: string[]
  accept_types: string[]
  max_size?: number | null
  min_value?: number | null
  max_value?: number | null
  suggestions: string[]
  multiple: boolean
  max_count?: number | null
}

/** 关联类型 */
export type AssociationType = 'belongs_to' | 'has_many' | 'has_many_through'

/** 关联定义 */
export interface AssociationDefinition {
  name: string
  type: AssociationType
  foreign_key: string
  target_class_name: string
  display_field: string
  searchable: boolean
  creatable: boolean
  through?: string | null
  order?: string | null
}

/** 列表列配置 */
export interface ListColumn {
  name: string
  link?: boolean
  badge?: boolean
  thumbnail?: boolean
  format?: 'relative_time' | 'currency' | 'text'
  display?: string
  width?: number
}

/** 表单字段配置 */
export interface FormField {
  name: string
  required?: boolean
  as?: 'text' | 'textarea' | 'rich_text' | 'radio' | 'switch'
    | 'select' | 'image' | 'file' | 'tags' | 'number'
    | 'date' | 'datetime' | 'color' | 'json'
}

/** 表单分区配置 */
export interface FormSection {
  title: string
  fields: FormField[]
}

/** 详情字段配置 */
export interface DetailField {
  name: string
  as?: 'heading' | 'badge' | 'rich_text_viewer' | 'text'
}

/** 详情分区配置 */
export interface DetailSection {
  title: string
  fields: DetailField[]
}

/** 展示配置 */
export interface DisplayConfig {
  list: {
    columns: ListColumn[]
  }
  form: {
    sections: FormSection[]
  }
  detail: {
    sections: DetailSection[]
    associations: Array<{
      name: string
      type: string
    }>
  }
}

/** 产品形态配置 */
export interface ProductConfig {
  type: 'crud' | 'kanban' | 'calendar' | 'gallery' | 'soft_delete'
  options: Record<string, any>
}

/** 完整模型元数据 */
export interface DslMeta {
  model_name: string
  fields: Record<string, FieldDefinition>
  associations: Record<string, AssociationDefinition>
  display: DisplayConfig
  products: ProductConfig[]
  batch_actions?: Array<{
    name: string
    label: string
    confirm?: string
  }>
  /** 有可见性限制的字段列表（后端已根据用户角色过滤） */
  restricted_fields?: string[]
}
