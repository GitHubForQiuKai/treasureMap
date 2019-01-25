# module模块

module模块看似在日常开发中不怎么用到，但其实处处用到，比如：
> 1. `require()`就是module上的一个方法。
> 2. require引入模块的机制。
> 3. 每个文件都视为独立的模块。

## 基本介绍
### 规范
NodeJS采用的CommonJS规范，可参考[CommonJS基本介绍](https://githubforqiukai.github.io/treasureMap/web/js/module.html#commonjs)。

### 模块分类
在nodeJS中模块大致可以分为两大类：
- **内置模块**（如：'http'、'fs'等）
- **文件模块**
    - 本地模块（如：'./unit'或'/paths/unit'自定义模块）
    - 第三方模块（如：'lodash'等）

在导入模块时，可省略后缀名，node将自动查找后缀为`.js`、`.json`、`node`的模块。
```js
// Native extension for .js
Module._extensions['.js'] = function(module, filename) {
    // ...
};

// Native extension for .json
Module._extensions['.json'] = function(module, filename) {
    // ...
};

// Native extension for .node
Module._extensions['.node'] = function(module, filename) {
    // ...
};
```

## 加载规则
当使用`require(X)`命令时，那么它到底是如何解析加载X的呢？

当 Node 遇到 require(X) 时，在不考虑缓存的情况下，按下面的顺序处理：

+ **I. 如果 X 是内置模块**
  - 1. 返回该模块。 
  - 2. 不再继续执行。

- **Ⅱ. 如果 X 以 `./` 或者 `/` 或者 `../` 开头**
    - 1. 根据 X 所在的父模块，确定 X 的绝对路径。 
    - 2. 将 X 当成文件，
        + a. 依次查找下面`X` || `X.js` || `X.json` || `X.node`文件，只要其中有一个存在，就返回该文件，不再继续执行。
    - 3. 将 X 当成目录，
        + a. 解析 `X/package.json`, 并查找 `main` 字段，查找 `X + mian`的文件，找到并返回，不再继续执行。
        + b. 依次查找下面`X` || `X.js` || `X.json` || `X.node`文件，只要其中有一个存在，就返回该文件，不再继续执行。

* **III. 如果 X 不带路径**
    - 1. 根据 X 所在的父模块，确定 X 可能的安装目录。 
    - 2. 依次在每个目录中，将 X 当成文件名或目录名加载。

+ **IV. 抛出 "not found"**

带缓存的情况  
![avatar](../../assets/nodejs-require.jpg)

## Module

了解了模块的加载规则后，下面就将对照源码进行分析，本文引用的源码是简化过的。

其实，简单来说加载模块无非就是两步：
+ 1. 根据X找到模块的具体位置。
+ 2. 根据找到的位置加载模块。

### module构造函数
```js
function Module(id, parent) {
  this.id = id;
  this.exports = {};
  this.parent = parent;
  updateChildren(parent, this, false); // 更新给定父模块的children 
  this.filename = null;
  this.loaded = false;
  this.children = [];
}
```
具体参数[可参考](https://githubforqiukai.github.io/treasureMap/web/js/module.html#commonjs)。


### require方法

每个模块实例都有一个`require`方法。

```js
Module.prototype.require = function(id) {
    return Module._load(id, this, /* isMain */ false);
};
```

可以看出，`require`方法并不是全局方法，而是每个`module`实例上的一个方法，也就是说，只有在模块内部才能使用`require`命令。

而之所以，能够在每个文件/模块调用`require`方法，是因为，在编译`_compile`模块时对模块进行了`wrap`包装。
``` js{3}
Module.prototype._compile = function(content, filename) {
   // create wrapper function
  var wrapper = Module.wrap(content);

  var compiledWrapper = vm.runInThisContext(wrapper, {
    filename: filename,
    lineOffset: 0,
    displayErrors: true,
    importModuleDynamically: experimentalModules ? async (specifier) => {
      if (asyncESM === undefined) lazyLoadESM();
      const loader = await asyncESM.loaderPromise;
      return loader.import(specifier, normalizeReferrerURL(filename));
    } : undefined,
  });
}
```

`wrap`方法的具体实现：
```js
Module.wrap = function(script) {
  return Module.wrapper[0] + script + Module.wrapper[1];
};

Module.wrapper = [
  '(function (exports, require, module, __filename, __dirname) { ',
  '\n});'
];
```
会将`exports`, `require`, `module`, `__filename`, `__dirname`作为每个模块内部的全局变量。

下面来看 Module._load 的源码。
```js
Module._load = function(request, parent, isMain) {
  if (parent) {
    debug('Module._load REQUEST %s parent: %s', request, parent.id);
  }
  
   //  计算绝对路径
  var filename = Module._resolveFilename(request, parent, isMain);
  
  //  第一步：如果有缓存，取出缓存
  var cachedModule = Module._cache[filename];
  if (cachedModule) {
    updateChildren(parent, cachedModule, true);
    return cachedModule.exports;
  }
  
  // 第二步：是否为内置模块
  if (NativeModule.canBeRequiredByUsers(filename)) {
    debug('load native module %s', request);
    return NativeModule.require(filename);
  }

  // 第三步：生成模块实例
  var module = new Module(filename, parent);

  // 是否是主程序入口
  if (isMain) {
    process.mainModule = module;
    module.id = '.';
  }
  
  // 第三步：存入缓存
  Module._cache[filename] = module;
  
  // 第四步：尝试加载模块
  tryModuleLoad(module, filename);
  
  // 第五步：输出模块的exports属性
  return module.exports;
};
```

::: tip
当 Node.js 直接运行一个文件时，`require.main` 会被设为它的 `module`。 这意味着可以通过 `require.main === module` 来判断一个文件是否被直接运行：
:::