import { PageContainer } from '@ant-design/pro-components'
import AdminLayout from '../../layouts/AdminLayout'
import type { ReactNode } from 'react'

Dashboard.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>

export default function Dashboard() {
  return (
    <PageContainer title="仪表盘">
      <p>欢迎回来！</p>
    </PageContainer>
  )
}
