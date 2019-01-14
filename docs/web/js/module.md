# 模块

## 什么是模块
在程序设计中，模块是指为完成某一功能所需的一段程序或子程序。它具有两个基本特征：**外部特征**和**内部特征**。  

外部特征是指模块跟外部环境所联系的接口（即其他模块或程序调用该模块的方式，包括有输入输出参数、引用的全局变量）和模块的功能；内部特征是指模块的内部环境具有的特点（即该模块的局部数据和程序代码）。  

简单的说：**模块就是实现特定功能的一组方法。**

## 基本写法
### 原始写法
是要把不同的函数（以及需要记录状态的变量）简单的放在一起，就构成了一个模块。
```js
function() m1{
    //...
}
function() m2{
    //...
}
```
上面的函数m1和m2就构成了一个模块，使用的时候直接调用就行了。
但是，缺点也很明显，“污染”了全局变量，无法保证不和其他模块发生变量名冲突的情况。

### 对象写法
顾名思义，就是把模板成员封装到一个对象中。
```js
var module = new Object({
    _count: 1,
    m1: funtion() {
        //...
    },
    m2: funtion() {
        //...
    }
});
```
使用的时候，直接调用这个对象的属性```module.m1()```。   
但是，这样的写法会暴露所有模块成员，内部状态可以被外部改写。比如，外部代码可以直接改变内部计数器的值。
```js
module._count = 3;
```

### 立即执行函数写法
使用"立即执行函数"（Immediately-Invoked Function Expression，IIFE）。
```js
var module = (function(){
    var _count = 1,
    var m1 = funtion() {
        //...
    },
    var m2 = funtion() {
        //...
    }
    return {
        m1,
        m2,
    }
})();
```
这样外部代码无法读取内部的_count变量。
```js
module._count // undefined
```
### 模块继承
如果一个模块过大，可能会拆分为多个模块。
```js
var module = (function(mod){
    mod.m3 = function() {
        //...
    }
})(module || {});
```
上面的代码为module模块添加了一个新方法m3()，然后返回新的module模块。

### 输入全局变量
为了保持模块的独立性，模块内部最好不与程序的其他部分直接交互。   
而为了在模块内部调用全局变量，必须显式地将其他变量输入模块。
```js
var module = (function($) {
    //...
})(jQuery);
```
上面的module模块需要使用jQuery库，就把这个库（其实是个模块）当作参数输入module。这样做除了保证模块的独立性，还使得模块之间的依赖关系变得明显。

## 发展及规范
2009年，美国程序员Ryan Dahl创造了node.js项目，将javascript语言用于服务器端编程。
这标志"Javascript模块化编程"正式诞生。  

在这之前，在浏览器环境下，没有模块也不是特别大的问题，毕竟网页程序的复杂性有限；但是在服务器端，一定要有模块，与操作系统和其他应用程序互动，否则根本没法编程。

### CommonJS
#### **实现代表**：nodeJS  
#### **关键字**：`module.exports`、`exports`、`require`  

这里的CommonJS规范指的是CommonJS Modules/1.0规范。  

CommonJS是一个更偏向于服务器端的规范。NodeJS采用了这个规范。CommonJS的一个模块就是一个脚本文件。

#### 表现形式
导入：
```js
// import.js
var m1 = require('./export.js');

m1();
```
导出：
```js
// export.js
var m1 = function (){};

module.exports = m1;
//或：exports.m1 = m1; // module.exports 和 exports 在下面会讲到
```

#### module对象
Node内部提供一个Module构建函数。所有模块都是Module的实例。
```js
function Module(id, parent){
    this.id = id;
    this.exports = {};
    this.parent = parent;
    //...
}
```
例如：
```js
// example.js
console.log(module)
```
输出值：
```js
Module {
  id: '.',
  exports: {},
  parent: null,
  filename: '/Users/qiukai/Desktop/example.js',
  loaded: false,
  children: [],
  paths: 
   [ '/Users/qiukai/Desktop/node_modules',
     '/Users/qiukai/node_modules',
     '/Users/node_modules',
     '/node_modules' ] }
```
|属性|含义|
|-|-|
|module.id|模块标识符，通常是带有绝对路径的模块文件名|
|module.exports|表示模块对外输入的值|
|module.parent|表示引用该模块的模块|
|module.filename|带有绝对路径的模块名|
|module.loaded|模块是否已加载|
|module.children|表示该模块引用的其他模块|
**注**：可根据module.parent是否为null来判断当前模块是否为入口脚本。

#### module.exports和exports
`exports`其实就是`module.exports`的别名，官方给出的解释：
![avatar](../../assets/exports-alias.png)
可以看出，将module.exports作为立即执行函数的第二个参数传入，并重新定义了exports接受它。其实，就可以理解为，在每个模块头部，加上
```js
var exports = module.exports;
```
**注意：不能直接将exports变量指向一个值，因为这样等于切断了exports与module.exports的引用。**

所以说，下面的一些写法将是无效的，
```js
// 例1
exports = function() {};

// 例2
exports.m1 = function() {};
module.exports = 'Hello world';//实际导出的是hello world
```
如果你觉得exports与module.exports之间的区别很难分清，一个简单的处理方法，就是放弃使用exports，只使用module.exports。


### AMD
#### **实现代表**：requireJS
#### **关键字**：`module.exports`、`exports`、`require`   

### CMD
实现代表：**seaJS**   

### UMD
实现代表：**nodejs**   

### ES6 Module
实现代表：**ECMAScript 2015**   
关键字：`import`、`export`、`export default`

## 编写

## 加载机制