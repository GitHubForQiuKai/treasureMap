# 发布/订阅模式

## 基本介绍
发布订阅模式指的是希望接收通知的对象（Subscriber）基于一个主题通过自定义事件订阅主题，被激活事件的对象（Publisher）通过发布主题事件的方式通知各个订阅该主题的 Subscriber 对象。

在此模式下订阅者把自己想订阅的事件注册到调度中心，当该事件触发时候，发布者发布该事件到调度中心（顺带上下文），由调度中心统一调度订阅者注册到调度中心的处理代码。

**发布/订阅模式和观察者模式本质是一样的，只是在实现上有所差异**，也可以说是观察者模式的改进版。

## 实现
### 要素
- **角色**
    - [发布者（Publisher）](#发布者)
        - **·** 发布具体的事件
    - [调度中心(Scheduler）](#调度中心)
        - **·** 负责管理自定义事件的整个生命周期
    - [订阅者（Subscriber）](#订阅者)
        - **·** 接到调度中心通知后的更新逻辑
- **动作**
    - **·** 发布
    - **·** 订阅
    - **·** 通知
    - **·** 更新

### 调度中心
下面是js实现版：
```js
var Scheduler = function() {
    var clientList = {},
        listen,
        trigger,
        remove;
        
    listen = function(key, fn){
        if(!clientList[key]){
            clientList[key] = [];
        }
        clientList[key].push(fn);
    };

    trigger = function(){
        var key = Array.prototype.shift.call(arguments);
        var fns = clientList[key];
        if(!fns || !fns.length) return;

        fns.forEach(fn => {
            fn.call(this, arguments);
        })
    };

    remove = function(key, fn){
        var fns = clientList[key];
        if(!fns || !fns.length) return;
        if(!fn){// 如果没有传入具体的函数，则移除全部
            fns.length = 0
        }else{
            fns.some((_fn,index) => {
                if(_fn === fn){
                    return !!fns.splice(index,1)
                }
            })
        };
    };

    return {
        listen,
        trigger,
        remove,
    }
}();
```

具体使用:
```js
var  Subscriber1 = function(){
    console.log('收到add事件')
}

var  Subscriber2 = function(){
    console.log('收到add事件')
}

var  Subscriber3 = function(){
    console.log('收到delete事件')
}

Scheduler.listen('add', Subscriber1);
Scheduler.listen('add', Subscriber2);
Scheduler.listen('delete', Subscriber3);

Scheduler.trigger('add'); 
// 收到add事件  收到add事件
Scheduler.trigger('delete'); 
// 收到delete事件

Scheduler.remove('add',Subscriber1);
Scheduler.trigger('add'); 
// 收到add事件

Scheduler.remove('delete');
Scheduler.trigger('delete'); 
```

## 离线缓存