// 用于建立与响应式对象属性的映射关系,全局唯一!
export let activeEffect: ReactiveEffect | undefined

class ReactiveEffect {
  public active = true // 创建的 effect 是否为响应式的

  /**
   * @param fn 用户传入的函数
   * @param scheduler 调度器函数,fn中依赖的数据发生变化后需要重新调用 run()
   */
  constructor(
    private fn,
    private scheduler,
  ) {}

  run() {
    if (!this.active) {
      return this.fn() // 不是响应式的,执行后不用做额外处理
    }
    // 防止嵌套的 effect,保证收集的永远是自己对应的
    const lastEffect: ReactiveEffect = activeEffect
    try {
      activeEffect = this
      return this.fn() // 是响应式的,需要进行依赖收集
    } finally {
      activeEffect = lastEffect
    }
  }
}

export const effect = (fn, options?) => {
  // 创建一个effect, 只要依赖的属性变化了就执行回调
  const _effect = new ReactiveEffect(fn, () => {
    _effect.run()
  })

  _effect.run()
}
