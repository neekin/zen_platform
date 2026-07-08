/**
 * Image Node
 *
 * 自定义 Lexical 节点，支持：
 * - 图片显示
 * - 缩放
 * - 对齐
 * - 标题
 */
import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
} from 'lexical'
import { DecoratorNode } from 'lexical'
import { ImageComponent } from './ImageComponent'

/** Image 节点属性 */
export interface ImagePayload {
  src: string
  alt?: string
  width?: number
  height?: number
  alignment?: 'left' | 'center' | 'right'
  caption?: string
  key?: NodeKey
}

/** 序列化格式 */
export type SerializedImageNode = Spread<
  {
    type: 'image'
    version: 1
    src: string
    alt?: string
    width?: number
    height?: number
    alignment?: 'left' | 'center' | 'right'
    caption?: string
  },
  SerializedLexicalNode
>

/** Image Node */
export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __alt: string
  __width: number
  __height: number
  __alignment: 'left' | 'center' | 'right'
  __caption: string

  static getType(): string {
    return 'image'
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__alt,
      node.__width,
      node.__height,
      node.__alignment,
      node.__caption,
      node.__key,
    )
  }

  constructor(
    src: string,
    alt: string = '',
    width: number = 800,
    height: number = 600,
    alignment: 'left' | 'center' | 'right' = 'center',
    caption: string = '',
    key?: NodeKey,
  ) {
    super(key)
    this.__src = src
    this.__alt = alt
    this.__width = width
    this.__height = height
    this.__alignment = alignment
    this.__caption = caption
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.style.display = 'flex'
    div.style.justifyContent = this.__alignment === 'center' ? 'center' : this.__alignment === 'right' ? 'flex-end' : 'flex-start'
    return div
  }

  updateDOM(): false {
    return false
  }

  setWidth(width: number): void {
    const writable = this.getWritable()
    writable.__width = width
  }

  setHeight(height: number): void {
    const writable = this.getWritable()
    writable.__height = height
  }

  setAlignment(alignment: 'left' | 'center' | 'right'): void {
    const writable = this.getWritable()
    writable.__alignment = alignment
  }

  setCaption(caption: string): void {
    const writable = this.getWritable()
    writable.__caption = caption
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      alt: this.__alt,
      width: this.__width,
      height: this.__height,
      alignment: this.__alignment,
      caption: this.__caption,
    }
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode({
      src: serializedNode.src,
      alt: serializedNode.alt,
      width: serializedNode.width,
      height: serializedNode.height,
      alignment: serializedNode.alignment,
      caption: serializedNode.caption,
    })
  }

  exportDOM(): DOMExportOutput {
    const img = document.createElement('img')
    img.setAttribute('src', this.__src)
    img.setAttribute('alt', this.__alt)
    img.style.maxWidth = '100%'
    return { element: img }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: (domNode: HTMLElement): DOMConversionOutput | null => {
          if (domNode instanceof HTMLImageElement) {
            return {
              node: $createImageNode({
                src: domNode.src,
                alt: domNode.alt,
                width: domNode.naturalWidth,
                height: domNode.naturalHeight,
              }),
            }
          }
          return null
        },
        priority: 0,
      }),
    }
  }

  decorate(): JSX.Element {
    return (
      <ImageComponent
        src={this.__src}
        alt={this.__alt}
        width={this.__width}
        height={this.__height}
        alignment={this.__alignment}
        caption={this.__caption}
        nodeKey={this.__key}
      />
    )
  }
}

/** 创建 Image Node */
export function $createImageNode(payload: ImagePayload): ImageNode {
  return new ImageNode(
    payload.src,
    payload.alt,
    payload.width,
    payload.height,
    payload.alignment,
    payload.caption,
    payload.key,
  )
}

/** 判断是否为 Image Node */
export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}
