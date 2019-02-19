# 执行环境

## 概念介绍
- 执行环境
- 执行环境栈
- 变量对象
- 活动对象
- 作用域链


JavaScript的执行环境的建立包含两个阶段：**执行环境的创建**和**可执行代码的执行**。

## 执行环境的创建
### 变量的声明
- 形参>函数>变量
- 默认都为`undefined`
- 变量声明相同则覆盖
- 函数声明相同则不覆盖


## 执行代码的执行
### 变量的赋值


函数声明比变量优先级要高，并且定义过程不会被变量覆盖，除非是赋值

```js
(function() {
    console.log(typeof foo); // 函数指针
    console.log(typeof bar); // undefined

    var foo = 'hello';
    var bar = 'world';
    
    bar = function() {
        return 'world';
    };

    function foo() {
        return 'hello';
    }
    console.log(bar) // function
    console.log(foo) // hello
}());
```