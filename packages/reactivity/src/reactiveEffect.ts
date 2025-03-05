import { activeEffect } from './effect'

export const track = (target, key) => {
  // activeEffect 有这个属性,说明这个key是在effect中访问的,需要进行依赖收集,反之不需要
  console.log(target, key, activeEffect)
}
