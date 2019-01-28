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

`Module.wrap`方法：
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

`Module._load`方法：
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

`Module._resolveFilename`方法：
```js
Module._resolveFilename = function(request, parent, isMain, options) {
  // 第一步：如果是原生模块，直接返回
  if (NativeModule.canBeRequiredByUsers(request)) {
    return request;
  }

  var paths;

  if (typeof options === 'object' && options !== null &&
      Array.isArray(options.paths)) {
   // ...
  } else {
    // 第二步：查找所有可能的路径
    paths = Module._resolveLookupPaths(request, parent, true);
  }

  // 第三步：获取真正的路径
  var filename = Module._findPath(request, paths, isMain);
  if (!filename) {
    // eslint-disable-next-line no-restricted-syntax
    var err = new Error(`Cannot find module '${request}'`);
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  }
  return filename;
};
```

`Module._resolveLookupPaths`方法：
```js
var modulePaths = [];
Module._resolveLookupPaths = function(request, parent, newReturn) {
  if (NativeModule.canBeRequiredByUsers(request)) {
    debug('looking for %j in []', request);
    return (newReturn ? null : [request, []]);
  }

  // 如果不是相对路径
  // CHAR_DOT: .
  // CHAR_FORWARD_SLASH: /
  // CHAR_BACKWARD_SLASH: \
  if (request.length < 2 || 
      request.charCodeAt(0) !== CHAR_DOT ||
      (request.charCodeAt(1) !== CHAR_DOT && request.charCodeAt(1) !== CHAR_FORWARD_SLASH && (!isWindows || request.charCodeAt(1) !== CHAR_BACKWARD_SLASH))
     ) {
    var paths = modulePaths;
    if (parent) {
      if (!parent.paths)
        paths = parent.paths = [];
      else
        paths = parent.paths.concat(paths);
    }

    // 如果是require('.')
    if (request === '.') {
      if (parent && parent.filename) {
        paths.unshift(path.dirname(parent.filename));
      } else {
        paths.unshift(path.resolve(request));
      }
    }

    debug('looking for %j in %j', request, paths);
    return (newReturn ? (paths.length > 0 ? paths : null) : [request, paths]);
  }

  // 如果父模块不存在
  if (!parent || !parent.id || !parent.filename) {
    // Make require('./path/to/foo') work - normally the path is taken
    // from realpath(__filename) but with eval there is no filename
    var mainPaths = ['.'].concat(Module._nodeModulePaths('.'), modulePaths);

    debug('looking for %j in %j', request, mainPaths);
    return (newReturn ? mainPaths : [request, mainPaths]);
  }

  // Is the parent an index module?
  // We can assume the parent has a valid extension,
  // as it already has been accepted as a module.
  const base = path.basename(parent.filename);
  var parentIdPath;
  if (base.length > indexLen) {
    var i = 0;
    for (; i < indexLen; ++i) {
      if (indexChars[i] !== base.charCodeAt(i))
        break;
    }
    if (i === indexLen) {
      // We matched 'index.', let's validate the rest
      for (; i < base.length; ++i) {
        const code = base.charCodeAt(i);
        if (code !== CHAR_UNDERSCORE &&
            (code < CHAR_0 || code > CHAR_9) &&
            (code < CHAR_UPPERCASE_A || code > CHAR_UPPERCASE_Z) &&
            (code < CHAR_LOWERCASE_A || code > CHAR_LOWERCASE_Z))
          break;
      }
      if (i === base.length) {
        // Is an index module
        parentIdPath = parent.id;
      } else {
        // Not an index module
        parentIdPath = path.dirname(parent.id);
      }
    } else {
      // Not an index module
      parentIdPath = path.dirname(parent.id);
    }
  } else {
    // Not an index module
    parentIdPath = path.dirname(parent.id);
  }
  var id = path.resolve(parentIdPath, request);

  // Make sure require('./path') and require('path') get distinct ids, even
  // when called from the toplevel js file
  if (parentIdPath === '.' &&
      id.indexOf('/') === -1 &&
      (!isWindows || id.indexOf('\\') === -1)) {
    id = './' + id;
  }

  debug('RELATIVE: requested: %s set ID to: %s from %s', request, id,
        parent.id);

  var parentDir = [path.dirname(parent.filename)];
  debug('looking for %j in %j', id, parentDir);
  return (newReturn ? parentDir : [id, parentDir]);
};
```