# module模块

module模块看似在日常开发中不怎么用到，但其实处处用到，比如：
- `require()`就是module上的一个方法。
- require引入模板的机制。
- 每个文件都视为独立的模块

所有说，充分理解module模块是很重要的。

## 基本介绍
### 规范
NodeJS采用的CommonJS规范，可参考[CommonJS基本介绍](https://githubforqiukai.github.io/treasureMap/web/js/module.html#commonjs)。

### 模块分类
在nodeJS中模块大致可以分为两大类：
- 原生模块（如：'http'、'fs'等）
- 文件模块
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

- 如果 X 是内置模块（比如 require('http'）) 
    1. 返回该模块。 
    2. 不再继续执行。

- 如果 X 以 `./` 或者 `/` 或者 `../` 开头 
    1. 根据 X 所在的父模块，确定 X 的绝对路径。 
    2. 将 X 当成文件，
        1. 依次查找下面`X` || `X.js` || `X.json` || `X.node`文件，只要其中有一个存在，就返回该文件，不再继续执行。
    3. 将 X 当成目录，
        1. 解析 `X/package.json`, 并查找 `main` 字段，查找 `X + mian`的文件，找到并返回，不再继续执行。
        2. 依次查找下面`X` || `X.js` || `X.json` || `X.node`文件，只要其中有一个存在，就返回该文件，不再继续执行。

- 如果 X 不带路径 
    1. 根据 X 所在的父模块，确定 X 可能的安装目录。 
    2. 依次在每个目录中，将 X 当成文件名或目录名加载。

- 抛出 "not found"

## Module对象

了解了模块的加载规则后，下面就将对照源码进行一步步分析。

其实，简单来说加载模块无非就是干了两件事情：
1. 根据X找到模块的具体位置。
2. 根据找到的位置加载模块。
