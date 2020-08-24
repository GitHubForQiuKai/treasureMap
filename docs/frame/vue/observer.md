# 数据响应式

## Watcher
`watcher`用于组件界面的通知更新。
在组件初始化中的挂载`mountComponent`时创建；也可以是用户在组件中自定义的`watcher`。

### update方法
当依赖变化更新时，会将此更新放入`queueWatcher`，在未来某个合适的时机执行队列中所有的更新（`run`方法）。
```js
/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */
update () {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true
  } else if (this.sync) {
    this.run()
  } else {
    queueWatcher(this)
  }
}
```
:::
相同依赖的更新只会放入队列一次
:::


### run方法
执行创建`watcher`时（`mountComponent`）传入的组件更新方法`updateComponent`。

```js
  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run () {
    if (this.active) {
      const value = this.get()
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }
```


## Dep
依赖`watcher`的收集、通知更新。

### depend方法
```js
  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }
```

## Observer
每个对象（包括子对象）对应一个`_ob_`实例


- defineReactive：根据`defineProperty`实现对象响应的主要方法