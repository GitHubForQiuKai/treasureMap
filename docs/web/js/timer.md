# 定时器
## 基本介绍
### setTimeout 延时执行
```setTimeout(fn,1000)```，1000ms后执行fn

### setInterval 定时执行
```setInterval(fn,100)```，每隔100m执行fn

:::warning
- setTimeout执行时间可能会**大于**给定时间。
- setInterval间隔执行的时间可能会**小于**给定时间。
:::

## setTimeout
JavaScript引擎在执行setTimeout(fn, 10)时，一方面继续执行setTimeout(fn, 10)后面的同步代码，同时另一方面开始计时，在10ms之后将fn插入任务队列中。  待所有同步代码执行结束后（JavaScript引擎空闲），依次任务队列中的异步代码。  

所以，setTimeout(fn, 10)并不能准确的在10ms之后执行，而是大于等于10ms。

```js
// 正常
console.time("time")
setTimeout(function() {
    console.timeEnd("time");
},10);
// time:10.9619140625ms

// 超时
console.time();
var i = 0;
for(var s =1;s<100000;s++){
	i += s;
};
setTimeout(function() {
    console.timeEnd();
},10);
// time:24.440185546875ms
```

## setInterval
与setTimeout()相同的是，如果当前没有同步代码在执行（JavaScript引擎空闲），则定时器对应的方法fn会被立即执行，否则，fn就会被加入到任务队列中。

由于定时器的事件是每隔10ms就触发一次，有可能某一次事件触发的时候，上一次事件的处理方法fn还没有机会得到执行，仍然在等待队列中，这个时候，这个fn事件就被丢弃，继续开始下一次计时。

需要注意的是，由于JavaScript引擎这种单线程异步的执行方式，有可能两次fn的实际执行时间间隔小于设定的时间间隔。比如上一个定时器事件的处理方法触发之后，等待了5ms才获得被执行的机会。而第二个定时器事件的处理方法被触发之后，马上就被执行了。那么这两者之间的时间间隔实际上只有5ms。

```js
var IntervalId = setInterval(function() {
    console.log(Date.now());
},10);
var i = 0;
for(var s =1;s<1000000;s++){
	i += s;
};
setTimeout(function() {
    clearInterval(IntervalId);
},100);
```
输出：
```js
1525943129602
1525943129607 // 距离上一次只间隔了5ms
1525943129618
1525943129628
1525943129639
1525943129648
1525943129657
1525943129669
1525943129678
1525943129688
1525943129699
```
**setInterval()并不适合实现精确的按固定间隔的调度操作。**

比如在处理动画帧数时，就不适合用setInterval，而应采用[requestAnimationFrame](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame)方法。
```js
// 简单粗暴的方法
var FPS = 60;
setInterval(draw, 1000/FPS);
// 当draw方法执行耗时大于1000/60 ms时，就会发生丢帧的现象。
```
## 总结
假如设定的时间间隔为10ms，则setTimeout(fn, 10)中的fn执行的时间间隔可能大于10ms，而setInterval(fn, 10)中fn执行的时间间隔可能小于10ms。

**所以说setTimeout()和setInterval()都不能满足精确的时间间隔。**