/**
 * 扩展 TextNode
 *
 * 支持字体颜色、背景色、字体大小
 */
import { TextNode } from 'lexical'

export class ExtendedTextNode extends TextNode {
  __color: string
  __backgroundColor: string
  __fontSize: string

  constructor(text: string, key?: string) {
    super(text, key)
    this.__color = ''
    this.__backgroundColor = ''
    this.__fontSize = ''
  }

  static getType(): string {
    return 'extended-text'
  }

  static clone(node: ExtendedTextNode): ExtendedTextNode {
    const newNode = new ExtendedTextNode(node.__text, node.__key)
    newNode.__color = node.__color
    newNode.__backgroundColor = node.__backgroundColor
    newNode.__fontSize = node.__fontSize
    return newNode
  }

  setColor(color: string): void {
    const self = this.getWritable()
    self.__color = color
  }

  getColor(): string {
    const self = this.getLatest()
    return self.__color
  }

  setBackgroundColor(color: string): void {
    const self = this.getWritable()
    self.__backgroundColor = color
  }

  getBackgroundColor(): string {
    const self = this.getLatest()
    return self.__backgroundColor
  }

  setFontSize(size: string): void {
    const self = this.getWritable()
    self.__fontSize = size
  }

  getFontSize(): string {
    const self = this.getLatest()
    return self.__fontSize
  }

  createDOM(config: any): HTMLElement {
    const element = super.createDOM(config)
    if (this.__color) {
      element.style.color = this.__color
    }
    if (this.__backgroundColor) {
      element.style.backgroundColor = this.__backgroundColor
    }
    if (this.__fontSize) {
      element.style.fontSize = this.__fontSize
    }
    return element
  }

  updateDOM(prevNode: ExtendedTextNode, dom: HTMLElement, config: any): boolean {
    const updated = super.updateDOM(prevNode, dom, config)
    if (prevNode.__color !== this.__color) {
      dom.style.color = this.__color
    }
    if (prevNode.__backgroundColor !== this.__backgroundColor) {
      dom.style.backgroundColor = this.__backgroundColor
    }
    if (prevNode.__fontSize !== this.__fontSize) {
      dom.style.fontSize = this.__fontSize
    }
    return updated
  }

  exportJSON(): any {
    const json = super.exportJSON()
    json.type = 'extended-text'
    json.color = this.__color
    json.backgroundColor = this.__backgroundColor
    json.fontSize = this.__fontSize
    return json
  }

  importJSON(json: any): ExtendedTextNode {
    const node = super.importJSON(json) as ExtendedTextNode
    node.__color = json.color || ''
    node.__backgroundColor = json.backgroundColor || ''
    node.__fontSize = json.fontSize || ''
    return node
  }
}

export function $createExtendedTextNode(text: string): ExtendedTextNode {
  return new ExtendedTextNode(text)
}

export function $isExtendedTextNode(node: any): node is ExtendedTextNode {
  return node instanceof ExtendedTextNode
}
