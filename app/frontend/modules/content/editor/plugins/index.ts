/**
 * 插件注册表
 *
 * 所有内置插件在这里注册
 */
import { boldPlugin } from './bold'
import { italicPlugin } from './italic'
import { underlinePlugin } from './underline'
import { strikethroughPlugin } from './strikethrough'
import { codePlugin } from './code'
import { historyPlugin } from './history'
import { headingPlugin } from './heading'
import { quotePlugin } from './quote'
import { listPlugin } from './list'
import { linkPlugin } from './link'
import { imagePlugin, createImagePlugin } from './image'
import type { Plugin } from '../../types'

/** 内置插件列表 */
export const builtinPlugins: Plugin[] = [
  historyPlugin,
  boldPlugin,
  italicPlugin,
  underlinePlugin,
  strikethroughPlugin,
  codePlugin,
  headingPlugin,
  quotePlugin,
  listPlugin,
  linkPlugin,
  imagePlugin,
]

/** 插件 ID 映射 */
export const pluginMap = new Map<string, Plugin>(
  builtinPlugins.map((plugin) => [plugin.id, plugin]),
)

/** 获取插件 */
export function getPlugin(id: string): Plugin | undefined {
  return pluginMap.get(id)
}

/** 注册自定义插件 */
export function registerPlugin(plugin: Plugin): void {
  pluginMap.set(plugin.id, plugin)
}

/** 导出各个插件 */
export { boldPlugin } from './bold'
export { italicPlugin } from './italic'
export { underlinePlugin } from './underline'
export { strikethroughPlugin } from './strikethrough'
export { codePlugin } from './code'
export { historyPlugin } from './history'
export { headingPlugin } from './heading'
export { quotePlugin } from './quote'
export { listPlugin } from './list'
export { linkPlugin } from './link'
export { imagePlugin, createImagePlugin } from './image'
export type { ImagePluginConfig } from './image'
