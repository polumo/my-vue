import { activeEffect, trackEffect, triggerEffects } from './effect'

/**
 * 依赖关系结构:
 * {
 *    target: {
 *      key: [
 *        effect, effect
 *      ]
 *    }
 * }
 */
const targetMap = new WeakMap()

const createDep = (cleanup, key) => {
  const dep = new Map() as any
  dep.cleanup = cleanup
  dep.key = key // 自定义标识,只是为了清楚看到当前dep是为哪个属性服务的(源码中没有)
  return dep
}

export const track = (target, key) => {
  // activeEffect 有这个属性,说明这个key是在effect中访问的,需要进行依赖收集,反之不需要
  if (activeEffect) {
    let depsMap = targetMap.get(target)

    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }

    let dep = depsMap.get(key)

    if (!dep) {
      depsMap.set(key, (dep = createDep(() => depsMap.delete(key), key)))
    }

    trackEffect(activeEffect, dep)
  }
  console.log(targetMap)
}

export const trigger = (target, key, newValue, oldValue) => {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }

  const dep = depsMap.get(key)
  if (dep) {
    triggerEffects(dep)
  }
}
