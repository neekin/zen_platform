/**
 * 状态标签组件
 *
 * 根据状态值显示不同颜色的标签
 */
import { Tag, Badge } from 'antd'

export type StatusBadgeProps = {
  /** 状态值 */
  value: string
  /** 状态配置 */
  statusMap?: Record<string, { label: string; color: string }>
  /** 显示模式 */
  mode?: 'tag' | 'badge'
}

const DEFAULT_STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: '启用', color: 'green' },
  inactive: { label: '禁用', color: 'red' },
  draft: { label: '草稿', color: 'default' },
  published: { label: '已发布', color: 'blue' },
  archived: { label: '已归档', color: 'orange' },
  pending: { label: '待审核', color: 'gold' },
  approved: { label: '已通过', color: 'green' },
  rejected: { label: '已拒绝', color: 'red' },
}

export default function StatusBadge({
  value,
  statusMap = DEFAULT_STATUS_MAP,
  mode = 'tag',
}: StatusBadgeProps) {
  const config = statusMap[value] || { label: value, color: 'default' }

  if (mode === 'badge') {
    return <Badge status={config.color as any} text={config.label} />
  }

  return <Tag color={config.color}>{config.label}</Tag>
}
