import { DslTable } from '@/modules/dsl/DslTable'

export default function ArticlesIndex({ meta, articles }: any) {
  return (
    <DslTable
      meta={meta}
      data={articles}
      basePath="/admin/articles"
      title="文章管理"
      createText="新建文章"
    />
  )
}
