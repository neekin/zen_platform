import {
  ProForm, ProFormText, ProFormTextArea, ProFormDigit, ProFormSwitch,
  ProFormSelect, ProFormRadio, ProFormDatePicker, ProFormDateTimePicker, ProCard,
} from '@ant-design/pro-components'
import { Form } from 'antd'
import { lazy, Suspense } from 'react'
import { useFieldPermissions } from '@/hooks/useFieldPermissions'
import type { DslMeta, FormSection, FormField, FieldDefinition, AssociationDefinition } from '@/types/dsl'

const LazyRichTextEditor = lazy(() =>
  import('../../modules/content').then(m => ({ default: m.RichTextEditor }))
)

export interface DslFormProps {
  meta: DslMeta
  initialValues?: Record<string, any>
  onFinish?: (values: Record<string, any>) => Promise<boolean | void>
  associations?: Record<string, Array<{ label: string; value: any }>>
  submitText?: string
  disabled?: boolean
}

export default function DslForm({
  meta,
  initialValues,
  onFinish,
  associations,
  submitText = '提交',
  disabled = false,
}: DslFormProps) {
  const sections: FormSection[] = meta.display.form?.sections || []
  const { canView, getFieldDisabled } = useFieldPermissions({
    field_permissions: meta.field_permissions,
  })

  return (
    <ProForm
      initialValues={initialValues || {}}
      onFinish={async (values) => {
        const result = await onFinish?.(values)
        return result !== false
      }}
      submitter={{
        searchConfig: { submitText },
        resetButtonProps: { style: { display: 'none' } },
      }}
    >
      {sections.map((section, index) => (
        <ProCard
          key={index}
          title={section.title !== 'default' ? section.title : undefined}
          style={{ marginBottom: 16 }}
        >
          {section.fields
            .filter((fieldConfig) => canView(fieldConfig.name))
            .map((fieldConfig) => (
              <DslFormField
                key={fieldConfig.name}
                fieldConfig={fieldConfig}
                fieldDef={meta.fields[fieldConfig.name]}
                association={findAssociation(meta, fieldConfig.name)}
                associationOptions={associations?.[fieldConfig.name]}
                disabled={disabled || getFieldDisabled(fieldConfig.name)}
              />
            ))}
        </ProCard>
      ))}
    </ProForm>
  )
}

function findAssociation(meta: DslMeta, fieldName: string): AssociationDefinition | undefined {
  if (meta.associations[fieldName]) return meta.associations[fieldName]
  const assocName = fieldName.replace(/_id$/, '')
  return meta.associations[assocName]
}

interface DslFormFieldProps {
  fieldConfig: FormField
  fieldDef?: FieldDefinition
  association?: AssociationDefinition
  associationOptions?: Array<{ label: string; value: any }>
  disabled?: boolean
}

function DslFormField({
  fieldConfig,
  fieldDef,
  association,
  associationOptions,
  disabled = false,
}: DslFormFieldProps) {
  const name = fieldConfig.name
  const label = fieldDef?.placeholder || name
  const rules = fieldConfig.required || fieldDef?.required
    ? [{ required: true, message: `请输入${name}` }]
    : []

  // 关联字段 → Select
  if (association || fieldDef?.reference) {
    return (
      <ProFormSelect
        name={name}
        label={label}
        options={associationOptions || []}
        rules={rules}
        disabled={disabled}
        showSearch
        allowClear
      />
    )
  }

  // enum 字段 → Radio 或 Select
  if (fieldDef?.type === 'enum' && fieldDef.enum_values.length > 0) {
    const options = fieldDef.enum_values.map((v) => ({ label: v, value: v }))
    if (fieldConfig.as === 'radio') {
      return (
        <ProFormRadio.Group
          name={name}
          label={label}
          options={options}
          rules={rules}
          disabled={disabled}
        />
      )
    }
    return (
      <ProFormSelect
        name={name}
        label={label}
        options={options}
        rules={rules}
        disabled={disabled}
      />
    )
  }

  // 按 as: 映射
  switch (fieldConfig.as) {
    case 'rich_text':
      return <RichTextFormField name={name} label={label} rules={rules} disabled={disabled} />
    case 'switch':
      return <ProFormSwitch name={name} label={label} disabled={disabled} />
    case 'textarea':
      return <ProFormTextArea name={name} label={label} rules={rules} disabled={disabled} />
    default:
      break
  }

  // 按 field type 推断
  switch (fieldDef?.type) {
    case 'text':
    case 'rich_text':
      return <ProFormTextArea name={name} label={label} rules={rules} disabled={disabled} />
    case 'integer':
    case 'decimal':
    case 'float':
      return <ProFormDigit name={name} label={label} rules={rules} disabled={disabled} />
    case 'boolean':
      return <ProFormSwitch name={name} label={label} disabled={disabled} />
    case 'date':
      return <ProFormDatePicker name={name} label={label} disabled={disabled} />
    case 'datetime':
      return <ProFormDateTimePicker name={name} label={label} disabled={disabled} />
    default:
      return <ProFormText name={name} label={label} rules={rules} disabled={disabled} />
  }
}

function RichTextFormField({ name, label, rules, disabled }: {
  name: string; label: string; rules: any[]; disabled: boolean
}) {
  const form = ProForm.useFormInstance()
  const content = Form.useWatch(name, form) || '{}'
  return (
    <ProForm.Item name={name} label={label} rules={rules}>
      <Suspense fallback={<div style={{ padding: 16, color: 'var(--ant-color-text-tertiary)' }}>加载编辑器...</div>}>
        <LazyRichTextEditor
          value={content}
          onChange={(val: string) => form.setFieldValue(name, val)}
          disabled={disabled}
          toolbar={['bold', 'italic', 'underline', 'heading', 'quote', 'bullet-list', 'numbered-list', 'link', 'image']}
        />
      </Suspense>
    </ProForm.Item>
  )
}
