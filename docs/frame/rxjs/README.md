# 基本概念
### Observable 可观察对象
- 表示一些事件的集合。
- 通过Observable.subscribe(fnValue,fnError,fnComplete)来获取数据、错误、完成事件。
- 通过Observable.unsubscribe()来清除它。
```js
let Observable = Rx.Observable.create((observer) => {
  observer.next(1); // fnValue 
  observer.next(2); // fnValue 可调用多次
  observer.error(); // fnError
  observer.complete(); // fnComplete
  
  return function(){
    clear(); // 清除逻辑
  }
});

Observable.subscribe(
(data) => console.log('Data', data),
(error) => console.log('Error', error),
(complete) => console.log('Complete', complete),
);

Observable.unsubscribe(); // 清除了Observable
```

## Observer 观察者
- 一个回调函数的集合，负责监听由 Observable 提供的值。
- 观察者只是有三个回调函数的对象，每个回调函数对应一种 Observable 发送的通知类型。
- 一个完整的observer对象包含next()、error()、complete()方法。
- 通过上述三个方法来驱动Observable。
```js
var observer = {
  next: x => console.log('Observer got a next value: ' + x),
  error: err => console.error('Observer got an error: ' + err),
  complete: () => console.log('Observer got a complete notification'),
};
```

## Observable包装
- 创建自定义逻辑的Observable对象。
- 通过next()、error()、complete()来驱动。
```js
let stream = Rx.Observable.create((observer) => {
   let request = new XMLHttpRequest();

   request.open( "GET","url");
   request.onload =() =>{
      if(request.status === 200) {
         observer.next( request.response );
         observer.complete();
     } else {
          observer.error('error happened');
     }
   }

   request.onerror = () => {  
       observer.error('error happened')
   }
   request.send();
})

stream.subscribe(
   (data) => console.log( data )  
)
```

## Operators 操作符
- rxjs的灵魂核心，rxjs的强大正是因为有了功能丰富的操作符。
- 没有操作符的rxjs的就好比是没有黄家驹的beyond的。
- 操作符是纯函数，它基于当前的 Observable 创建一个新的 Observable。这是一个无副作用的操作：前面的 Observable 保持不变。
- 区分 实例操作符 和 静态操作符
- [操作符列表](https://cn.rx.js.org/manual/overview.html#-#creation-operators)
```js
function multiplyByTen(input) {
  var output = Rx.Observable.create(function subscribe(observer) {
    input.subscribe({
      next: (v) => observer.next(10 * v),
      error: (err) => observer.error(err),
      complete: () => observer.complete()
    });
  });
  return output;
}

var input = Rx.Observable.from([1, 2, 3, 4]);
var output = multiplyByTen(input);
output.subscribe(x => console.log(x));

```
### 实例操作符
- 依赖于Observable实例
```js
var observable = Rx.Observable.from([1, 2, 3, 4]).multiplyByTen();
```
### 静态操作符
- 依赖于Observable类
```js
Rx.Observable.interval(1000 /* 毫秒数 */);
```

## Marble diagrams 弹珠图

![](https://user-gold-cdn.xitu.io/2018/5/5/1632e808f6a22d91?w=748&h=384&f=jpeg&s=71361)