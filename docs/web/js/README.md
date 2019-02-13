# 类型

## 基本类型
在js中有6中基本类型：
- **·** Undefined
- **·** Null
- **·** String
- **·** Number
- **·** Boolean
- **·** Symbol

首先基本类型存储的都是值，基本类型的数据不具备“对象”的特性——不携带属性、没有方法可调用。 沿用它们只是为了迎合人类根深蒂固的习惯，并的确能简单、有效地进行常规数据处理。

而之所以，我们平时看似可以使用一些基本类型上的方法，是因为其已自动转换为[基本类型对象](#基本类型对象)了，下文中会做介绍。

### Undefined
`Undefined`类型只有一个值`undefined`，`undefined`是全局对象的一个属性。也就是说，它是全局作用域的一个变量。`undefined`的最初值就是基本类型`undefined`。

在现代浏览器（JavaScript 1.8.5/Firefox 4+），自ECMAscript5标准以来`undefined`是一个不能被配置（non-configurable），不能被重写（non-writable）的属性。即便事实并非如此，也要避免去重写它。

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
`Null`类型只有一个值`null`，`null` 是一个字面量，它的语义表示空值，它不像`undefined` 是全局对象的一个属性，`null` 是 JavaScript 关键字，所以在任何代码中，你都可以放心用 `null` 关键字来获取 `null` 值。

::: tip
关于```typeof null``` 会返回`object`。

并不是说明`null`是`object`类型，这只是 JavaScript 存在的一个悠久 Bug。

在 JavaScript 的最初版本中使用的是 `32` 位系统，为了性能考虑使用低位存储变量的类型信息，`000` 开头代表是对象，然而 `null` 表示为全零，所以将它错误的判断为 `object` 。

虽然现在的内部类型判断代码已经改变了，但是对于这个 Bug 却是一直流传下来。
:::

### String

### Number

### Boolean

### Symbol

## 基本类型对象
在 JavaScript 中`String` `Number` `Boolean` `Symbol`都会有对应的基本类型对象。

通过**字面量**和直接调用**构造方法**(没有通过`new`生成对象实例)的基本类型。

JavaScript会自动将基本类型转换为基本类型对象，只有将基本类型转化为基本类型对象之后才可以使用基本类型对象的方法。

当基本类型需要调用一个基本类型对象才有的方法或者查询值的时候(基本类型是没有这些方法的)，JavaScript 会自动将基本类型转化为基本类型对象并且调用相应的方法或者执行查询。
```js
var s_prim = "foo";
var s_obj = new String("foo");

console.log(typeof s_prim); // string
console.log(typeof s_obj);  // object
```

### 装箱
把基本数据类型转换为对应的引用类型的操作称为**装箱**。
```js
var s1 = "some text";
var s2 = s1.substring(2);
```
如上所视，变量s1是一个基本类型值，它不是对象，所以它不应该有方法。但是 JavaScript 内部为我们完成了一系列处理（即我们称之为装箱），使得它能够调用方法,实现的机制如下：
1. 创建String类型的一个实例。
2. 在该实例上调用方法。
3. 销毁该实例。
```js
var s1 = new String("some test");
var s2 = s1.substring(2);
s1 = null;
```

对于其他的一些基本类型`symbol`，并没有提供`new Symbol()`类似的构造函数，这时，我们就需要进行**显式装箱**，我们可以利用`Object()`构造方法来显式的为基本类型进行装箱操作
```js
var symbolObject = Object(Symbol('aa'));

console.log(typeof symbolObject); // object
console.log(symbolObject instanceof Symbol); // true
console.log(Object.prototype.toString.call(symbolObject)); // [object symbol]
```

### 拆箱
相反的，把引用类型转换为基本的数据类型称为**拆箱**。

在 JavaScript 标准中，规定了 ToPrimitive 函数，它是对象类型到基本类型的转换。

在拆箱过程中，会尝试调用`valueOf`和`toString`方法来获得拆箱后的基本类型。如果 `valueOf` 和 `toString` 都不存在，或者没有返回基本类型，则会产生类型错误 `TypeError`。
```js
var a = {
    valueOf: function(){
        console.log('valueOf');
        return {};
    },
    toString: function(){
        console.log('toString');
        return {};
    }
}
a - 1;
// valueOf
// toString
// TypeError: Cannot convert object to primitive value
```
:::tip
`String` 的拆箱转换会优先调用 `toString`。我们把刚才的运算从 `o - 1` 换成 `o + “”`，那么调用顺序就变了。
:::


当然，在 `ES6`，还可通过显式的指定`Symbol.toPrimitive`来覆盖原来的行为：
```js
    var o = {
        valueOf: function() {
            console.log("valueOf"); 
            return {}
        },
        toString: function() {
            console.log("toString"); 
            return {}
        }
    }

    o[Symbol.toPrimitive] = function() {
        console.log("toPrimitive"); 
        return "hello"
    }

    console.log(o + "")
    // toPrimitive
    // hello
```

## 对象类型
Object 是 JavaScript 中最复杂的类型，也是 JavaScript 的核心机制之一。Object 表示对象的意思，它是一切有形和无形物体的总称。

在 JS 中，除了基本类型那么其他的都是对象类型了。对象类型和基本类型不同的是，基本类型存储的是值，对象类型存储的是地址（指针）。当你创建了一个对象类型的时候，计算机会在内存中帮我们开辟一个空间来存放值，但是我们需要找到这个空间，这个空间会拥有一个地址（指针）。

## 类型转换