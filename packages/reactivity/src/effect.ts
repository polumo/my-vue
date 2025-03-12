// 用于建立与响应式对象属性的映射关系,全局唯一!
export let activeEffect: ReactiveEffect | undefined

const cleanDepEffect = (dep, effect) => {
  dep.delete(effect)
  // 如果该属性没有依赖任何effect了,则清除其本身
  if (dep.size === 0) {
    dep.cleanup()
  }
}

const preCleanEffect = (effect: ReactiveEffect) => {
  effect._depsLength = 0
  effect._trackId++ // 每次执行+1,如果当前同一个effect执行,id就是相同的
}

// 如果前一次的依赖为{flag,name,xxx},当前为{flag},则需要删除多余的
const postCleanEffect = (effect: ReactiveEffect) => {
  if (effect.deps.length > effect._depsLength) {
    for (let i = effect._depsLength; i < effect.deps.length; i++) {
      cleanDepEffect(effect.deps[i], effect) // 清除 targetMap 中的
    }
    effect.deps.length = effect._depsLength // 清除 effect.deps 中的
  }
}

class ReactiveEffect {
  public active = true // 创建的 effect 是否为响应式的

  // 1.用于记录当前 effect 执行次数,防止一个属性在一个effect中多次依赖收集
  // 2.拿到上一次依赖的最后一个和这次的比较
  public _trackId = 0
  public deps = [] // 当前effect的所有依赖
  public _depsLength = 0

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

      // effect 重新执行前,需要将上一次的依赖情况清除
      preCleanEffect(this)

      return this.fn() // 是响应式的,需要进行依赖收集
    } finally {
      postCleanEffect(this)
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

// 双向记忆
export const trackEffect = (effect: ReactiveEffect, dep) => {
  /**
   * 问题:
   * 1.同一effect中重复访问同一属性时,会重复收集
   * 2.effect重新执行时,可能会有不再需要的属性没有清除掉
   *    例如: state.flag ? state.name : state.age, 第一次为 {flag, name},修改flag后,需要{flag, age},但是name未删除
   * 解决方案:
   * 1.使用_trackId进行追踪,收集之前判断
   * 2.获取前一次的与当前的进行比对,相同则跳过;不同则将当前的存入,并删除targetMap中上一次的
   */
  if (dep.get(effect) !== effect._trackId) {
    dep.set(effect, effect._trackId)

    const oldDep = effect.deps[effect._depsLength]

    // 比对前一次的和当前的吗
    if (oldDep !== dep) {
      // 如果前一次存在,需要进行删除
      if (oldDep) {
        cleanDepEffect(oldDep, effect)
      }
      // 不同则存入最新的
      effect.deps[effect._depsLength++] = dep
    } else {
      effect._depsLength++ // 相同则跳过
    }
  }
}

export const triggerEffects = dep => {
  for (const effect of dep.keys()) {
    if (effect.scheduler) {
      effect.scheduler()
    }
  }
}
