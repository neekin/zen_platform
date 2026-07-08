# 虚拟滚动使用指南

## 概述

虚拟滚动用于优化大数据量表格的性能，只渲染可视区域内的行，大幅减少 DOM 节点数量和内存占用。

## 何时使用虚拟滚动

| 数据量 | 建议方案 |
|--------|----------|
| < 1000 行 | 传统分页（默认） |
| 1000-10000 行 | 可选虚拟滚动 |
| > 10000 行 | 强烈推荐虚拟滚动 |

## 后端配置

### 1. 游标分页

后端 QueryBuilder 已支持游标分页，只需在请求中添加 `cursor` 参数：

```ruby
# 传统分页
GET /admin/users?page=1&per_page=20

# 游标分页
GET /admin/users?per_page=50&cursor=12345&cursor_direction=after&sort=id&sort_dir=asc
```

### 2. 响应格式

游标分页返回以下 meta 信息：

```json
{
  "records": [...],
  "meta": {
    "per_page": 50,
    "has_more": true,
    "next_cursor": 12395,
    "pagination_type": "cursor"
  }
}
```

## 前端使用

### 方式 1: DslTable 组件（推荐）

```tsx
import DslTable from '@/modules/dsl/DslTable'

function MyPage({ data, meta, cursorPagination }) {
  return (
    <DslTable
      meta={meta}
      data={data}
      basePath="/admin/users"
      virtual={true}  // 启用虚拟滚动
      cursorPagination={cursorPagination}  // 游标分页配置
      serverSide={true}
      onServerChange={(params) => {
        // 处理分页请求
        router.get(`/admin/users?${new URLSearchParams(params)}`)
      }}
    />
  )
}
```

### 方式 2: VirtualTable 组件

```tsx
import VirtualTable from '@/components/VirtualTable'

function MyTable({ data, columns }) {
  return (
    <VirtualTable
      dataSource={data}
      columns={columns}
      virtual={true}
      height={600}
      cursorPagination={{
        hasMore: true,
        nextCursor: '12345',
        onLoadMore: (cursor) => {
          // 加载更多数据
          fetchMore(cursor)
        },
        loadingMore: false,
      }}
    />
  )
}
```

### 方式 3: useCursorPagination Hook

```tsx
import { useCursorPagination } from '@/hooks/useCursorPagination'

function MyPage() {
  const { data, loading, loadMore, cursorPagination } = useCursorPagination({
    basePath: '/admin/users',
    perPage: 50,
    virtual: true,
  })

  return (
    <VirtualTable
      dataSource={data}
      columns={columns}
      virtual={true}
      cursorPagination={cursorPagination}
    />
  )
}
```

## 控制器示例

```ruby
class Admin::UsersController < Admin::BaseController
  def index
    @users = UserResource.query(params)
    
    respond_to do |format|
      format.html  # Inertia 渲染
      format.json { render json: @users }  # 游标分页加载更多
    end
  end
end
```

## 性能对比

| 指标 | 传统分页 | 虚拟滚动 |
|------|----------|----------|
| 首屏渲染 | 20-50 行 | 50-100 行 |
| DOM 节点数 | 随页数增长 | 恒定 (~100) |
| 内存占用 | 线性增长 | 恒定 |
| 滚动流畅度 | 一般 | 流畅 |
| 加载更多 | 点击翻页 | 自动加载 |

## 注意事项

1. **虚拟滚动阈值**: 当数据量 > 1000 行时自动启用虚拟滚动
2. **行高**: 虚拟滚动使用固定行高（默认 54px），动态行高需要额外配置
3. **排序字段**: 游标分页必须基于唯一字段排序（通常是 id）
4. **搜索/过滤**: 搜索或过滤后会重置游标，从第一页重新加载

## 故障排查

### 问题：虚拟滚动没有生效

检查条件：
- 数据量是否 > 1000 行
- `virtual` 属性是否设为 `true`
- `cursorPagination` 是否正确配置

### 问题：滚动时出现白屏

可能原因：
- 行高设置不正确
- `overscan` 值太小（默认 200px）

解决方案：
```tsx
<VirtualTable
  rowHeight={60}  // 调整行高
  // overscan 会自动计算
/>
```

### 问题：加载更多不触发

检查：
- `cursorPagination.hasMore` 是否为 `true`
- `cursorPagination.nextCursor` 是否有值
- `onLoadMore` 回调是否正确实现
