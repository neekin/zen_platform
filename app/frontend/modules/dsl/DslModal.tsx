import React from 'react'
import { Modal, type ModalProps } from 'antd'

/**
 * DSL 弹窗组件
 *
 * 统一封装弹窗样式，确保：
 * 1. 弹窗整体高度不超过浏览器视图
 * 2. 顶部（标题栏）和底部（如果有）固定
 * 3. 中间内容区域可滚动
 *
 * 基于 antd Modal 封装，支持所有 antd Modal 的属性
 */
export type DslModalProps = Omit<ModalProps, 'styles'> & {
  /** 内容区域最大高度（默认 calc(100vh - 200px)） */
  maxBodyHeight?: string
}

export default function DslModal({
  maxBodyHeight = 'calc(100vh - 200px)',
  styles,
  ...props
}: DslModalProps) {
  return (
    <Modal
      {...props}
      styles={{
        ...styles,
        body: {
          maxHeight: maxBodyHeight,
          overflowY: 'auto',
          paddingTop: 16,
          paddingBottom: 16,
          ...styles?.body,
        },
      }}
    />
  )
}
