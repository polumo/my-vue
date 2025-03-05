import { isObject } from '@vue/shared'

enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}

// 用于记录代理后的结果,防止同一个对象被多次代理
const reactiveMap = new WeakMap()

const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }
  },
  set(target, key, value, receiver) {
    return true
  },
}

const createReactiveObject = (target: any) => {
  if (!isObject(target)) {
    return target
  }

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

export const reactive = (target: unknown) => {
  return createReactiveObject(target)
}
