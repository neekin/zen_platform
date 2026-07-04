/**
 * 文本样式工具栏
 *
 * 字体颜色、背景色、字体大小选择器
 */
import { useState } from 'react'
import { Dropdown, Tooltip, Space, ColorPicker, Select } from 'antd'
import {
  FontColorsOutlined,
  BgColorsOutlined,
 FontSizeOutlined,
} from '@ant-design/icons'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getSelection, $isRangeSelection } from 'lexical'
import { $isExtendedTextNode, $createExtendedTextNode } from '../nodes/ExtendedTextNode'

const FONT_SIZES = [
  { label: '12px', value: '12px' },
  { label: '14px', value: '14px' },
  { label: '16px', value: '16px' },
  { label: '18px', value: '18px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
  { label: '28px', value: '28px' },
  { label: '32px', value: '32px' },
  { label: '36px', value: '36px' },
]

const PRESET_COLORS = [
  '#000000', '#333333', '#666666', '#999999',
  '#ff0000', '#ff4500', '#ff8c00', '#ffd700',
  '#008000', '#00ced1', '#1e90ff', '#0000ff',
  '#800080', '#ff69b4', '#a52a22', '#f5f5f5',
]

export default function TextFormatToolbar() {
  const [editor] = useLexicalComposerContext()
  const [fontColor, setFontColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffff00')
  const [fontSize, setFontSize] = useState('16px')

  const applyToSelection = (apply: (node: any) => void) => {
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      const nodes = selection.getNodes()
      nodes.forEach((node) => {
        if ($isExtendedTextNode(node)) {
          apply(node)
        } else if (node.getType() === 'text') {
          const textNode = node as any
          const extendedNode = $createExtendedTextNode(textNode.getTextContent())
          extendedNode.setFormat(textNode.getFormat())
          apply(extendedNode)
          textNode.replace(extendedNode)
        }
      })
    })
  }

  const handleFontColorChange = (_: any, hex: string) => {
    setFontColor(hex)
    applyToSelection((node) => node.setColor(hex))
  }

  const handleBgColorChange = (_: any, hex: string) => {
    setBgColor(hex)
    applyToSelection((node) => node.setBackgroundColor(hex))
  }

  const handleFontSizeChange = (value: string) => {
    setFontSize(value)
    applyToSelection((node) => node.setFontSize(value))
  }

  return (
    <Space size={4}>
      <Tooltip title="字体颜色">
        <ColorPicker
          value={fontColor}
          onChange={handleFontColorChange}
          presets={[{ label: '预设', colors: PRESET_COLORS }]}
          size="small"
        >
          <span style={{ cursor: 'pointer', padding: '0 4px' }}>
            <FontColorsOutlined style={{ color: fontColor }} />
          </span>
        </ColorPicker>
      </Tooltip>

      <Tooltip title="背景色">
        <ColorPicker
          value={bgColor}
          onChange={handleBgColorChange}
          presets={[{ label: '预设', colors: PRESET_COLORS }]}
          size="small"
        >
          <span style={{ cursor: 'pointer', padding: '0 4px' }}>
            <BgColorsOutlined style={{ color: bgColor }} />
          </span>
        </ColorPicker>
      </Tooltip>

      <Tooltip title="字体大小">
        <Select
          value={fontSize}
          onChange={handleFontSizeChange}
          options={FONT_SIZES}
          size="small"
          style={{ width: 80 }}
          popupMatchSelectWidth={false}
        />
      </Tooltip>
    </Space>
  )
}
