import { DslTable } from '@/modules/dsl/DslTable'

export default function CommentsIndex({ meta, comments }: any) {
  return (
    <DslTable
      meta={meta}
      data={comments}
      basePath="/admin/comments"
      title="评论管理"
      createText="新建评论"
    />
  )
}
