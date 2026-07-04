# 自定义插件

## 插件架构

每个插件是一个目录，包含 `index.ts` 导出：

```typescript
// app/frontend/modules/content/editor/plugins/my-plugin/index.ts
import { createPlugin } from '../factory'

export const myPlugin = createPlugin({
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  toolbarItems: [
    { id: 'my-plugin', icon: MyIcon, label: 'My Plugin', group: 'insert' },
  ],
  commands: {
    'my-plugin': (context) => {
      // 执行逻辑
    },
  },
  shortcuts: {
    'ctrl+shift+x': 'my-plugin',
  },
})

export { MyPluginComponent } from './MyPluginComponent'
```

## 创建插件

1. 创建目录 `app/frontend/modules/content/editor/plugins/my-plugin/`
2. 创建 `index.ts` 导出插件定义
3. 在 `RichTextEditor.tsx` 中注册插件
4. 在 `plugins/index.ts` 中导出

## DecoratorNode

对于需要在编辑器中渲染 React 组件的插件，使用 Lexical 的 `DecoratorNode`：

```typescript
import { DecoratorNode } from 'lexical'

export class MyNode extends DecoratorNode<React.ReactNode> {
  static getType() { return 'my-node' }
  static clone(node) { return new MyNode(node.__data, node.__key) }

  createDOM() { return document.createElement('div') }
  updateDOM() { return false }

  decorate() {
    return <MyComponent data={this.__data} />
  }

  exportJSON() {
    return { type: 'my-node', version: 1, data: this.__data }
  }

  static importJSON(serializedNode) {
    return new MyNode(serializedNode.data)
  }
}
```
