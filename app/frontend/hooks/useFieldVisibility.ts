/**
 * 字段联动 Hook
 *
 * 根据表单值和 visible_when 条件动态计算字段可见性
 *
 * @example
 * // DSL 定义
 * field :end_date, :date, visible_when: { status: "published" }
 * field :reason, :text, visible_when: { status: ["rejected", "cancelled"] }
 *
 * // 前端使用
 * const { isFieldVisible } = useFieldVisibility(meta.fields, formValues)
 */
import { useMemo } from 'react'
import type { FieldDefinition } from '@/types/dsl'

interface UseFieldVisibilityOptions {
  fields: Record<string, FieldDefinition>
  values: Record<string, any>
}

/**
 * 检查单个条件是否满足
 */
function checkCondition(conditionValue: any, fieldValue: any): boolean {
  // 数组条件：字段值必须在数组中
  if (Array.isArray(conditionValue)) {
    return conditionValue.includes(fieldValue)
  }

  // 对象条件：支持操作符
  if (typeof conditionValue === 'object' && conditionValue !== null) {
    const operator = conditionValue.operator
    const value = conditionValue.value

    switch (operator) {
      case 'eq':
        return fieldValue === value
      case 'neq':
        return fieldValue !== value
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue)
      case 'notIn':
        return Array.isArray(value) && !value.includes(fieldValue)
      case 'gt':
        return fieldValue > value
      case 'gte':
        return fieldValue >= value
      case 'lt':
        return fieldValue < value
      case 'lte':
        return fieldValue <= value
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.includes(value)
      case 'notEmpty':
        return fieldValue != null && fieldValue !== ''
      case 'empty':
        return fieldValue == null || fieldValue === ''
      default:
        return fieldValue === conditionValue
    }
  }

  // 简单值：直接比较
  return fieldValue === conditionValue
}

export function useFieldVisibility({ fields, values }: UseFieldVisibilityOptions) {
  const visibility = useMemo(() => {
    const result: Record<string, boolean> = {}

    Object.entries(fields).forEach(([fieldName, fieldDef]) => {
      if (!fieldDef.visible_when || Object.keys(fieldDef.visible_when).length === 0) {
        result[fieldName] = true
        return
      }

      // 所有条件都必须满足（AND 逻辑）
      const allConditionsMet = Object.entries(fieldDef.visible_when).every(
        ([dependentField, condition]) => {
          const dependentValue = values[dependentField]
          return checkCondition(condition, dependentValue)
        }
      )

      result[fieldName] = allConditionsMet
    })

    return result
  }, [fields, values])

  const isFieldVisible = (fieldName: string): boolean => {
    return visibility[fieldName] ?? true
  }

  const getVisibleFields = (): string[] => {
    return Object.entries(visibility)
      .filter(([_, visible]) => visible)
      .map(([name]) => name)
  }

  return {
    visibility,
    isFieldVisible,
    getVisibleFields,
  }
}
