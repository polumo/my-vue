import { track } from './reactiveEffect'

export enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
}

export const mutableHandlers: ProxyHandler<any> = {
  get(target, key, receiver) {
    /**
     * 如果一个对象是 proxy 对象,那么访问它的属性必定触发 get,以此就可以判断一个对象是否是 proxy 对象了
     * 这里很巧妙,值得学习
     */
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true
    }

    // 依赖收集
    // 在 effect 中访问时将访问对象和它的属性与 effect 建立映射关系
    track(target, key)

    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    // TODO: 触发更新
    // 修改值时,根据映射关系找到对应的 effect 使其重新执行

    Reflect.set(target, key, value, receiver)
    return true
  },
}
