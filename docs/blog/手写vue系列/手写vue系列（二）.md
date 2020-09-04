---
title: 手写Vue系列（二）
date: 2019-09-02
sidebar: 'auto'
categories:
 - vue
tags:
 - vue
publish: true
---

# 前言
[Vue Router](https://router.vuejs.org/zh/)是`Vue.js`官方路由管理器。它和`Vue.js`的核心深度集成，让构建单页面应用变得易如反掌。包含的功能有：
- 嵌套的路由/视图表
- 模块化的、基于组件的路由配置
- 路由参数、查询、通配符
- 基于`Vue.js`过渡系统的视图过渡效果
- 细粒度的导航控制
- 带有自动激活的`CSS class`的链接
- `HTML5`历史模式或`hash`模式，在`IE9`中自动降级
- 自定义的滚动条模式 

`vue-router`源码目录结构
```js
├── components  // 组件
│   ├── link.js   // route-link的实现
│   └── view.js   // route-view的实现
├── create-matcher.js  // 创建匹配
├── create-route-map.js  // 创建路由的映射
├── history  // 操作浏览器记录的一系列内容
│   ├── abstract.js  // 非浏览器的history
│   ├── base.js    // 基本的history
│   ├── hash.js    // hash模式的history
│   └── html5.js   // html5模式的history
├── index.js   // 入口文件
├── install.js  // 插件安装的方法
└── util   // 工具类库
    ├── async.js    // 异步操作的工具库
    ├── dom.js    // dom相关的函数
    ├── location.js     // 对location的处理
    ├── misc.js     // 一个工具方法
    ├── params.js   // 处理参数
    ├── path.js     // 处理路径
    ├── push-state.js  // 处理html模式的 pushState
    ├── query.js  //对query的处理
    ├── resolve-components.js  //异步加载组件
    ├── route.js  // 路由
    ├── scroll.js  //处理滚动
    └── warn.js  // 打印一些警告
```

## 基本使用

```js
import Vue from 'vue'
import VueRouter from 'vue-router'
// 1. 定义 (路由) 组件。
import VueRouter from './quick'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Detail from '../views/Detail.vue'

// 0. 注册插件
Vue.use(VueRouter)

// 2. 定义路由（配置）
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    component: About,
    children: [
      {
        path: 'detail/:id',
        component: Detail
      }
    ]
  }
]

// 3. 创建 router 实例，然后传 `routes` 配置
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 4. 创建和挂载根实例。
const app = new Vue({
  router
}).$mount('#app')
```

```html
<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>
```

## 分析实现
从上诉来分析`vue-router`的基本实现，主要可以概括为`3`部分：
- `VueRouter`类
- `router-view`组件
- `router-link`组件

在实现上诉3大件之前，还需要分析一件事：  
在我们使用`Vue-Router`时，会发现**页面地址变化，但是并没有刷新界面**，对于这种的实现有2种模式：
- `hash`模式  
    1. 通过地址栏`URL`中的`#`后地址的改变
    2. 监听`windows`上的`onhashchange`事件
- `history`模板  
    1. 通过[HTML5 History](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/history)的`api`的操作
    2. 监听`windows`上的`onpopstate`事件

## 实现`VueRouter`类
`VueRouter`类主要做几件事：
1. 实现静态`install`方法（因为是插件）
2. 加载`router`配置
3. 监听`url`变化事件
    a. 通过[path-to-regexp](https://github.com/pillarjs/path-to-regexp)将`url`解析成格式化的`route`对象
    b. 收集成功匹配当前`path`的`routes`配置数组`matched`

### 实现静态`install`方法
```js
let _Vue
class QuickRouter {

    constructor(options) {
        this.options = options
        this.route = Object.create(null)
    }
}

QuickRouter.install = (Vue) => {
    // 防止多次install
    if (QuickRouter.installed) return

    QuickRouter.installed = true

    // 保存外部传入的Vue
    _Vue = Vue

    /**
     * 全局混入beforeCreate方法
     * 延迟挂载$router对象
     * 因为先执行了use(Router)，而这时router对象还未产生
     */
    Vue.mixin({
        beforeCreate() {
            if (this.$options.router) {
                Vue.prototype.$router = this.$options.router
                Vue.prototype.$routerRoot = this.$root
                Vue.prototype.$route = this.$options.router.route

                // 响应式route
                Vue.util.defineReactive(this, 'route', this.$options.router.route)
            }
        }
    })

    // 注册全局组件
    Vue.component('router-link', {
        render(h) {
            return <a>link</a>
        }
    })
    Vue.component('router-view', {
        render(h) {
            return <div>view</div>
        }
    })
}
```
:::tip  
由于`Vue.use`注册在前，所以需要延迟待`router`对象产生后，再借用`mixin`的`beforeCreate`进行挂载。
:::

### 加载`router`配置
按层级的方式，将`routes`转换为`map`方便后面获取对应`path`的组件

```js
let _Vue

class QuickRouter {

    constructor(options) {
        this.options = options
        this.routesMap = Object.create(null)
        this.loadRoutes()
    }

    // 加载routes，并将转换为map
    loadRoutes() {
        const routes = this.options.routes
        routes.forEach(route => {
            const fullPath = route.path
            this.routesMap[fullPath] = route
            this._recRoutes(route, fullPath)
        })
    }

    // 递归加载route
    _recRoutes(route, path = '') {
        if (!route.children || !route.children.length) {
            return
        }

        const routes = route.children
        routes.forEach(item => {
            item.parent = route // 记录父级，为以后view做层级渲染
            const fullPath = path + '/' + item.path
            this.routesMap[fullPath] = item
            this._recRoutes(item, fullPath)
        })
    }

}
```

### 获取`path`
在获取`path`时，首先要获取浏览器对应的`url`地址，而`hash`和`history`模式对应不同的获取方式，这里将其统一封装到`getPath`函数中

```js
    /**
     * 获取path
     * todo 这里的获取path还不全面，query后面的参数未获取
     */
    getPath() {
        const mode = this.options.mode
        if (mode === 'hash') {
            // 这里通过window.localtion.hash来获取并不准确，会有浏览器兼容性问题
            // 更好的做法是通过window.localtion.href来手动截取
            return '/' + window.localtion.hash
        }

        return window.location.pathname
    }
```

:::tip
官方在处理浏览器`url`相关时，通过抽象出`HashHistory`和`Html5History`类继承了顶级`History`类来实现，会更加合理。这里暂时先不做处理
:::

### 监听`url`事件
```js
    constructor(options) {
        // ...

        this.route = Object.create(null) // 当前route
        this.depth = 0 // 记录router-view层级深度
        this.listen() // 监听路由改变事件
        this.path = this.getPath() || '/' // 浏览器的有效path

        this.createRoute()// 需主动调用一次，获取route，因为此时的listen事件已过时失效，
    }

    // 监听路由改变事件
    listen() {
        const eventType = this.options.mode === 'history' ? 'popstate' : 'hashchange'
        window.addEventListener(eventType, this.handleRoutingEvent.bind(this))
        window.addEventListener('load', this.handleRoutingEvent.bind(this))
    }

    // 事件处理句柄
    handleRoutingEvent() {
        this.depth = 0 // 重置depth
        this.createRoute()// 解析path
    }

    /**
     * 解析path为route对象
     */
    createRoute() {
        Object.keys(this.routesMap).forEach(path => {
            if (path) {
                const matched = match(path)(this.path);
                if (matched) {
                    this.route = matched
                    this.route.realPath = path
                    this.route.matched = this._collectMatcted(this.routesMap[path])
                }
            }
        })
    }
```

### 最终VueRouter类
```js
import { match } from "path-to-regexp"

let _Vue

class QuickRouter {

    constructor(options) {
        this.options = options
        this.routesMap = Object.create(null) // 路由配置map
        this.loadRoutes() // 加载路由配置

        this.route = Object.create(null) // 当前route
        this.depth = 0 // 记录router-view层级深度
        this.listen() // 监听路由改变事件
        this.path = this.getPath() || '/' // 浏览器的有效path

        this.createRoute()// 需主动调用一次，因为此时的listen已失效，获取route
    }


    // 加载routes，并将转换为map
    loadRoutes() {
        const routes = this.options.routes
        routes.forEach(route => {
            const path = route.path
            this.routesMap[path] = route
            this._recRoutes(route, path, 0)
        })
    }

    // 递归加载route
    _recRoutes(route, path = '') {
        if (!route.children || !route.children.length) {
            return
        }

        const routes = route.children
        routes.forEach(item => {
            item.parent = route // 记录父级，为以后view做层级渲染
            const fullPath = path + '/' + item.path
            this.routesMap[fullPath] = item
            this._recRoutes(item, fullPath)
        })
    }

    // 监听路由改变事件
    listen() {
        const eventType = this.options.mode === 'history' ? 'popstate' : 'hashchange'
        window.addEventListener(eventType, this.handleRoutingEvent.bind(this))
        window.addEventListener('load', this.handleRoutingEvent.bind(this))
    }

    // 事件处理句柄
    handleRoutingEvent() {
        this.depth = 0 // 重置depth
        this.createRoute()// 解析path
    }

    /**
     * 获取path
     * todo 这里的获取path还不全面，query后面的参数未获取
     */
    getPath() {
        const mode = this.options.mode
        if (mode === 'hash') {
            // 这里通过window.localtion.hash来获取并不准确，会有浏览器兼容性问题
            // 更好的做法是通过window.localtion.href来手动截取
            return '/' + window.localtion.hash
        }

        return window.location.pathname
    }

    /**
     * 解析path为route对象
     */
    createRoute() {
        Object.keys(this.routesMap).forEach(path => {
            if (path) {
                const matched = match(path)(this.path);
                if (matched) {
                    this.route = matched
                    this.route.realPath = path
                    this.route.matched = this._collectMatcted(this.routesMap[path])
                }
            }
        })
    }

    /**
     * 收集matched记录，包括父级
     */
    _collectMatcted(record) {
        const ret = []

        while (record) {
            // 从父->子的顺序放置
            ret.unshift(record)
            record = record.parent
        }
        return ret

    }
}
```

## 实现`link` `view`组件
其中`link` `view`组件都用函数式组件来实现，以提高性能。
```js
    // link组件
    Vue.component('router-link', {
        functional: true,

        render(h, { props, children }) {
            return h('a',
                {
                    attrs: {
                        href: props.to
                    }
                }, children)
        }
    })

    // view组件
    Vue.component('router-view', {
        functional: true,

        render(h, { parent }) {

            // 函数式组件，通过parent获取$router实例
            const route = parent.$router.route

            /**
             * 通过depth获取当前层级对应的comp。
             */
            const comp = route.matched[parent.$router.depth]
            if (comp && comp.component) {
                // 每渲染一个routerview，depth++
                parent.$router.depth++
                // 渲染组件
                return h(comp.component)
            }

            return h()
        }
    })
```
:::tip 
对于如何找到正确的`depth`位置，官方是通过赋值`data.routerView`，然后每次遍历其`parent`上的`data`是否有`routerView`属性来判断其是否是`routerView`组件。
:::

## 代码
- [git地址](https://github.com/GitHubForQiuKai/quick-router)
- [博客地址](https://qiukai666.gitee.io/treasureMap/blog/%E6%89%8B%E5%86%99vue%E7%B3%BB%E5%88%97/%E6%89%8B%E5%86%99vue%E7%B3%BB%E5%88%97%EF%BC%88%E4%BA%8C%EF%BC%89.html)