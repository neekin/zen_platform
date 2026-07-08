import { PageContainer } from '@ant-design/pro-layout'
import { ProCard, ProDescriptions } from '@ant-design/pro-components'

export default function ArticlesShow({ meta, article }: any) {
  return (
    <PageContainer>
      <ProCard>
        <ProDescriptions
          title="文章详情"
          dataSource={article}
          columns={[
            { title: '标题', dataIndex: 'title' },
            { title: '状态', dataIndex: 'status' },
            { title: '分类', dataIndex: 'category' },
            { title: '发布时间', dataIndex: 'published_at' },
          ]}
        />
      </ProCard>
    </PageContainer>
  )
}
