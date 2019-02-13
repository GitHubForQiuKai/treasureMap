# 类型

## 基本类型
- Undefined
- Null
- String
- Number
- Boolean
- Symbol

首先基本类型存储的都是值，基本类型的数据不具备“对象”的特性——不携带属性、没有方法可调用。 沿用它们只是为了迎合人类根深蒂固的习惯，并的确能简单、有效地进行常规数据处理。

而之所以，我们平时看似可以使用一些基本类型上的方法，是因为其已自动转换为[基本类型包装对象](#包装对象)了，下文中会做介绍。

### Undefined
undefined是全局对象的一个属性。也就是说，它是全局作用域的一个变量。undefined的最初值就是基本类型undefined。

在现代浏览器（JavaScript 1.8.5/Firefox 4+），自ECMAscript5标准以来undefined是一个不能被配置（non-configurable），不能被重写（non-writable）的属性。即便事实并非如此，也要避免去重写它。

```js
Object.getOwnPropertyDescriptor(window, undefined);

// 返回
{
    value: undefined,
    writable: false, 
    enumerable: false, 
    configurable: false
}
```

关于判断`undefined`的常用方法:
```js
var x;

// 1.使用 ===
console.log(x === undefined); // true
console.log(y === undefined); // Uncaught ReferenceError: y is not defined

// 2.使用 typeof
console.log(typeof x === 'undefined'); // true
console.log(typeof y === 'undefined'); // true

// 3.使用 void 0
console.log(x === void 0); // true
console.log(y === void 0); // Uncaught ReferenceError: y is not defined
```

### Null

### String

### Number

### Boolean

### Symbol

### 包装对象

## 对象类型
Object 是 JavaScript 中最复杂的类型，也是 JavaScript 的核心机制之一。Object 表示对象的意思，它是一切有形和无形物体的总称。

在 JS 中，除了基本类型那么其他的都是对象类型了。对象类型和基本类型不同的是，基本类型存储的是值，对象类型存储的是地址（指针）。当你创建了一个对象类型的时候，计算机会在内存中帮我们开辟一个空间来存放值，但是我们需要找到这个空间，这个空间会拥有一个地址（指针）。
