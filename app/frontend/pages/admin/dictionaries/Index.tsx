import { useState } from 'react'
import { router } from '@inertiajs/react'
import { ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components'
import { App, Button, Modal, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import AdminLayout from '@/layouts/AdminLayout'
import CRUDDataTable from '@/components/admin/CRUDDataTable'
import DslModal from '@/modules/dsl/DslModal'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'

interface DictionaryRecord {
  id: number
  key: string
  translations: Record<string, string>
  group: string
  created_at: string
  updated_at: string
}

type DictionariesIndexProps = {
  dictionaries: DictionaryRecord[]
  pagination: { page: number; per_page: number; total: number }
  locales: string[]
  groups: string[]
}

function DictionariesIndex({ dictionaries, pagination, locales, groups }: DictionariesIndexProps) {
  const { message } = App.useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<DictionaryRecord | null>(null)
  const { t } = useTranslation()

  const columns = [
    { title: t('dictionaries.id'), dataIndex: 'id', key: 'id', width: 60 },
    {
      title: t('dictionaries.key'),
      dataIndex: 'key',
      key: 'key',
      width: 250,
      ellipsis: true,
    },
    {
      title: t('dictionaries.group'),
      dataIndex: 'group',
      key: 'group',
      width: 120,
      render: (_: any, record: DictionaryRecord) => record.group ? <Tag>{record.group}</Tag> : '-',
      filters: groups.map(g => ({ text: g, value: g })),
      onFilter: (value: any, record: DictionaryRecord) => record.group === value,
    },
    {
      title: t('dictionaries.translations'),
      dataIndex: 'translations',
      key: 'translations',
      width: 200,
      render: (_: any, record: DictionaryRecord) => {
        const langs = Object.keys(record.translations || {})
        if (langs.length === 0) return '-'
        return (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {langs.map(lang => (
              <Tag key={lang} color={lang === 'zh-CN' ? 'blue' : 'green'}>
                {lang}
              </Tag>
            ))}
          </div>
        )
      },
    },
    {
      title: t('dictionaries.updatedAt'),
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (_: any, record: DictionaryRecord) => new Date(record.updated_at).toLocaleString(),
      sorter: (a: DictionaryRecord, b: DictionaryRecord) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
    },
  ]

  const initialValues = editingEntry ? {
    key: editingEntry.key,
    group: editingEntry.group,
    ...Object.fromEntries(
      locales.map(locale => [locale, editingEntry.translations?.[locale] || ''])
    ),
  } : { group: 'default' }

  return (
    <>
      <CRUDDataTable<DictionaryRecord>
        headerTitle={t('dictionaries.title')}
        rowKey="id"
        columns={columns}
        dataSource={dictionaries}
        pagination={{
          current: pagination.page,
          pageSize: pagination.per_page,
          total: pagination.total,
        }}
        toolBarRender={() => [
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => { setEditingEntry(null); setModalOpen(true) }}>
            {t('dictionaries.newEntry')}
          </Button>,
        ]}
        crudConfig={{
          resource: 'dictionaries',
          enableCreate: false,
          enableEdit: false,
          extraActions: (record) => [
            {
              key: 'edit',
              label: t('common.edit'),
              icon: <EditOutlined />,
              onClick: () => { setEditingEntry(record); setModalOpen(true) },
            },
          ],
        }}
      />

      <DslModal
        title={editingEntry ? t('dictionaries.editEntry') : t('dictionaries.newEntry')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={600}
      >
        <ProForm
          initialValues={initialValues}
          onFinish={async (values) => {
            const { key, group, ...translationValues } = values
            const translations: Record<string, string> = {}
            locales.forEach(locale => {
              if (translationValues[locale]) {
                translations[locale] = translationValues[locale]
              }
            })

            const method = editingEntry ? 'patch' : 'post'
            const url = editingEntry ? `/admin/dictionaries/${editingEntry.id}` : '/admin/dictionaries'
            router[method](url, { dictionary: { key, group, translations } }, {
              onSuccess: () => {
                setModalOpen(false)
              },
              onError: (errors) => {
                message.error(Object.values(errors).join(', ') || t('dictionaries.operationFailed'))
              },
            })
            return true
          }}
          submitter={{
            searchConfig: { submitText: editingEntry ? t('common.update') : t('common.create') },
            resetButtonProps: { style: { display: 'none' } },
          }}
        >
          <ProFormText
            name="key"
            label={t('dictionaries.key')}
            rules={[{ required: true, message: t('dictionaries.keyPlaceholder') }]}
            placeholder={t('dictionaries.keyPlaceholder')}
            disabled={!!editingEntry}
          />
          <ProFormText
            name="group"
            label={t('dictionaries.group')}
            placeholder={t('dictionaries.groupPlaceholder')}
          />
          {locales.map(locale => (
            <ProFormTextArea
              key={locale}
              name={locale}
              label={`${t('dictionaries.value')} (${locale})`}
              placeholder={`${t('dictionaries.valuePlaceholder')} (${locale})`}
            />
          ))}
        </ProForm>
      </DslModal>
    </>
  )
}

DictionariesIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>
export default DictionariesIndex
