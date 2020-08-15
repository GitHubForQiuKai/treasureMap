# diff算法和虚拟dom

## diff 算法
### 传统Diff算法
时间复杂度O(n^3)
1. 将两个DOM树的所有节点两两对比，时间复杂度 O(n^2)
2. 再对比较的节点进行查找（增删改），时间复杂度 O(n)

### React Diff 算法
深度优先，同层比较，时间复杂度O(n)
- 只对同层节点进行比较和操作（增删改）

### Vue Diff(patch) 算法
深度优先，同层比较，时间复杂度O(n)
```js
mountComponent -> patch -> patchVnode -> updateChildren -> sameVnode 
-> patchVnode(递归)
```

#### updateChildren（Vnode查找逻辑）
- 在进行遍历查找时，会进行web开发的常规操作查找（一般是首尾节点的增删改）
- 如果不进行特别的算法优化，直接双循环查找，时间复杂度为O(n^2)
```js
sameVnode(oldStartVnode, newStartVnode) // (老/新)数组(首/首)节点比较
sameVnode(oldEndVnode, newEndVnode) // (老/新)数组(尾/尾)节点比较
sameVnode(oldStartVnode, newEndVnode) // (老/新)数组(首/尾)节点比较
sameVnode(oldEndVnode, newStartVnode) // (老/新)数组(尾/首)节点比较
findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx) // 最后进行遍历操作
// 如果老数组还有剩余，就执行删除操作
// 如果新数组还有剩余，就执行新增操作
```

#### sameVnode（判断节点相同）
根据`key`精确判断节点是否相同  
- 标识当前层级节点的唯一性
- 如果没有设置`key`属性，那么`a.key(undefined) === b.key(undefined)`就会一直相等，对节点就会进行更新`patchVnode`操作(相同不更新，不同则强制更新)
- 如果设置了`key`，不会影响`vnode`的查找次数（真正影响次数的是updateChildren下的Vnode查找逻辑），但是更新`patchVnode`中的更新节点操作会减少
```js
function sameVnode (a, b) {
  return (
    a.key === b.key && (
      (
        a.tag === b.tag &&
        a.isComment === b.isComment &&
        isDef(a.data) === isDef(b.data) &&
        sameInputType(a, b)
      ) || (
        isTrue(a.isAsyncPlaceholder) &&
        a.asyncFactory === b.asyncFactory &&
        isUndef(b.asyncFactory.error)
      )
    )
  )
}
```

#### patchVnode（Vnode更新逻辑）
主要做3件事
- 属性更新
- 文本更新
- 子节点更新（和文本是互斥的）

##### 属性更新
其中`cbs`就是保存[modules](#patch)下的所有属性的更新方法
```js
// 方法复制
export function createPatchFunction (backend) {
  let i, j
  const cbs = {}

  // 这里的modules就是所有属性操作的方法
  const { modules, nodeOps } = backend

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }
```

```js
// 属性更新
if (isDef(data) && isPatchable(vnode)) {
  for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
  if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
}
```

##### 文本更新 & 子节点更新
更新规则
- 新旧节点都有`children`，比较更新子节点（递归操作）
- 新节点有`children`，旧节点没有（新增）
- 新节点没有`children`，旧节点有（删除）
- 新旧节点都没有`children`，文本替换

```js
// 获取新旧节点的孩子节点
const oldCh = oldVnode.children
const ch = vnode.children

// 新节点没有文本
if (isUndef(vnode.text)) {
  // 老新节点都有孩子
  if (isDef(oldCh) && isDef(ch)) {
    // !qk 子节点更新 递归操作
    if (oldCh !== ch) updateChildren(elm, oldCh, chinsertedVnodeQueue, removeOnly)
  } else if (isDef(ch)) { // 只有新节点有孩子
    if (process.env.NODE_ENV !== 'production') {
      checkDuplicateKeys(ch)
    }
    if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
    addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)//新增孩子节点
  } else if (isDef(oldCh)) { // 只有旧节点有孩子节点
    removeVnodes(oldCh, 0, oldCh.length - 1) // 删除孩子节点
  } else if (isDef(oldVnode.text)) { // 旧节点有文本
    nodeOps.setTextContent(elm, '') // 设置文本节点为空
  }
} else if (oldVnode.text !== vnode.text) { // 都有文本节点，且不相等
  nodeOps.setTextContent(elm, vnode.text)// 设置文本节点
}
```
::: tip
如果上述条件都不满足，则不做任何操作，即复用旧节点
:::


#### patch
`patch`是每个平台特有的扩展，其中包含`modules`和`nodeOps`
- `modules` 平台特有的属性操作（class/attrs/events）等
- `nodeOps` 平台特有的节点操作（createElement/appendChild/setTextContent）等
```js
// src\platforms\web\runtime\patch.js
const modules = platformModules.concat(baseModules)

// return patch()方法
export const patch: Function = createPatchFunction({ nodeOps, modules }) 
```
