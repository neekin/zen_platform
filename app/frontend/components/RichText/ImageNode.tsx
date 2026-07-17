import { DecoratorNode } from 'lexical'
import type { LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical'

type SerializedImageNode = Spread<{ src: string; alt: string; width?: number }, SerializedLexicalNode>

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __alt: string
  __width?: number

  static getType(): string { return 'image' }
  static clone(node: ImageNode): ImageNode { return new ImageNode(node.__src, node.__alt, node.__width, node.__key) }

  constructor(src: string, alt: string, width?: number, key?: NodeKey) {
    super(key)
    this.__src = src
    this.__alt = alt
    this.__width = width
  }

  createDOM(): HTMLElement { return document.createElement('span') }
  updateDOM(): boolean { return false }

  decorate(): JSX.Element {
    return (
      <img
        src={this.__src}
        alt={this.__alt}
        style={{ maxWidth: '100%', height: 'auto', ...(this.__width ? { width: this.__width } : {}) }}
      />
    )
  }

  exportJSON(): SerializedImageNode {
    return { src: this.__src, alt: this.__alt, width: this.__width, type: 'image', version: 1 }
  }

  static importJSON(json: SerializedImageNode): ImageNode {
    return new ImageNode(json.src, json.alt, json.width)
  }
}

export function $createImageNode(src: string, alt: string, width?: number): ImageNode {
  return new ImageNode(src, alt, width)
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}
