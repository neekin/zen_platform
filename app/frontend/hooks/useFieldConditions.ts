/**
 * 字段联动条件 Hook
 *
 * 统一处理 visible_when、disabled_when、required_when 三种联动条件
 *
 * @example
 * // DSL 定义
 * field :end_date, :date, visible_when: { status: "published" }
 * field :email, :string, disabled_when: { verified: true }
 * field :reason, :text, required_when: { status: "rejected" }
 *
 * // 前端使用
 * const { isFieldVisible, isFieldDisabled, isFieldRequired } = useFieldConditions(meta.fields, formValues)
 */
import { useMemo } from 'react'
import type { FieldDefinition } from '@/types/dsl'

interface UseFieldConditionsOptions {
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

/**
 * 检查一组条件是否全部满足（AND 逻辑）
 */
function checkAllConditions(conditions: Record<string, any>, values: Record<string, any>): boolean {
  if (!conditions || typeof conditions !== 'object') return true
  if (Object.keys(conditions).length === 0) return true

  return Object.entries(conditions).every(([dependentField, condition]) => {
    const dependentValue = values[dependentField]
    return checkCondition(condition, dependentValue)
  })
}

export function useFieldConditions({ fields, values }: UseFieldConditionsOptions) {
  // 计算所有字段的可见性
  const visibility = useMemo(() => {
    const result: Record<string, boolean> = {}

    Object.entries(fields).forEach(([fieldName, fieldDef]) => {
      if (!fieldDef.visible_when || Object.keys(fieldDef.visible_when).length === 0) {
        result[fieldName] = true
        return
      }
      result[fieldName] = checkAllConditions(fieldDef.visible_when, values)
    })

    return result
  }, [fields, values])

  // 计算所有字段的禁用状态
  const disabledState = useMemo(() => {
    const result: Record<string, boolean> = {}

    Object.entries(fields).forEach(([fieldName, fieldDef]) => {
      if (!fieldDef.disabled_when || Object.keys(fieldDef.disabled_when).length === 0) {
        result[fieldName] = false
        return
      }
      result[fieldName] = checkAllConditions(fieldDef.disabled_when, values)
    })

    return result
  }, [fields, values])

  // 计算所有字段的必填状态
  const requiredState = useMemo(() => {
    const result: Record<string, boolean> = {}

    Object.entries(fields).forEach(([fieldName, fieldDef]) => {
      // 静态 required
      const staticRequired = fieldDef.required === true

      // 动态 required_when
      let dynamicRequired = false
      if (fieldDef.required_when && Object.keys(fieldDef.required_when).length > 0) {
        dynamicRequired = checkAllConditions(fieldDef.required_when, values)
      }

      // 任一满足即为必填
      result[fieldName] = staticRequired || dynamicRequired
    })

    return result
  }, [fields, values])

  const isFieldVisible = (fieldName: string): boolean => {
    return visibility[fieldName] ?? true
  }

  const isFieldDisabled = (fieldName: string): boolean => {
    return disabledState[fieldName] ?? false
  }

  const isFieldRequired = (fieldName: string): boolean => {
    return requiredState[fieldName] ?? false
  }

  const getVisibleFields = (): string[] => {
    return Object.entries(visibility)
      .filter(([_, visible]) => visible)
      .map(([name]) => name)
  }

  return {
    visibility,
    disabledState,
    requiredState,
    isFieldVisible,
    isFieldDisabled,
    isFieldRequired,
    getVisibleFields,
  }
}
