import { isObject } from '@vue/shared'
import { mutableHandlers, ReactiveFlags } from './baseHandler'

// 用于记录代理后的结果,防止同一个对象被重复代理
const reactiveMap = new WeakMap()

const createReactiveObject = (target: any) => {
  if (!isObject(target)) {
    return target
  }

  // 访问该属性如果触发 get,则代表其已经是一个 proxy,直接返回
  if (target[ReactiveFlags.IS_REACTIVE]) {
    return target
  }

  const exitsProxy = reactiveMap.get(target)
  if (exitsProxy) {
    return exitsProxy
  }

  const proxy = new Proxy(target, mutableHandlers)
  reactiveMap.set(target, proxy)
  return proxy
}

/**
 * 将传入的对象转换为响应式对象,通过 Proxy 实现
 *
 * 需要处理的问题
 * 1.传入的数据如果不是对象
 * 2.一个对象被重复传入
 * 3.传入的对象已经是响应式对象
 *
 * 解决方案:
 * 1.直接返回传入的数据
 * 2.将传入的数据与代理后的数据建立映射关系,多次传入时直接返回已有的
 * 3.访问响应式数据的属性必定触发 get,以此判断传入的数据是否为响应式数据
 */
export const reactive = (target: unknown) => {
  return createReactiveObject(target)
}
