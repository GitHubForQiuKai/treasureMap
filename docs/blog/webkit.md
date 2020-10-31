
## 第1章
渲染引擎
- html解释器
- css解释器
- 布局
- js引擎
- 绘图

## 第2章
html结构
- 树状结构
- 层次结构
    - 比如，video/canvas/3d变化的需要单独分层
- 框结构（iframe）

URL（资源地址）是URI（资源标识）的一种实现

canvas的渲染2d还是3d最终是由js来决定的

图2-6

渲染3大阶段
- url -> dom树
- dom树 -> 绘图上下文
- 绘图上下文 -> 最终图像

图2-7
图2-8


DOMContentLoaded：dom创建完成
onLoad：表示资源加载完成


## 第3章
chromium多进程模型
- 单个页面崩溃是不影响页面
- 插件崩溃时不影响页面
- 安全模式，即沙箱模型是基于多进程的
- 进程之间通过IPC进行通信

chromium浏览器进程
- Browser进程
    - 负责包括地址栏，书签栏，前进后退按钮等部分的工作；
    - 负责处理浏览器的一些不可见的底层操作，比如网络请求和文件访问；
- renderer进程
    - GUI渲染线程
- GPU进程
    - 只有一个，用于3D渲染
- 插件进程

IPC进程工作原理？IO线程的作用？

## 第4章
缓存机制：LRU（最近最少使用）cache

DNS预解析

缓存
- 内存缓存
- 磁盘缓存


cookie
`key-value`形式：`test=123;Expires=Sun;Domain=baidu.com`
- 会话型
    当浏览器关闭时失效
- 持续型
    在cookie有效期内使用


HTTP:应用层
SPDY:会话层
SSL:表示层
TCP:传输层
IP:链路层

网络
为保证网络的快速和安全
- dns预解析
    `<link ref="dns-prefetch">`
- TCP预连接
- http1.1管线化
- SPDY
    会话层协议，是http2的基础


`chrome://net-internals/`可以来进行网络抓包

## 第5章
dom定义是一组与平台、语言无关的接口，以面向对象的方式来描述、操作文档

xml/html/xhtml都是文档，dom操作可以改变html等文档的结构

HTML内容包括
- document 文档
- node 节点
- attribute 属性
- element 元素
- text 文本

图5-5

词法分析
图5-8
内部实现是一个状态机，通过输入字符串到`nextToken`函数来获取一个词语

词语的类别
- DOCTYPE
- StartTag
- EndTag
- Comment
- Character
- EndOfFile

从节点到dom树的构建过程使用`栈`结构来帮忙

### dom事件
3个阶段：
1. 捕获阶段（true）
2. 目标阶段
3. 冒泡阶段（false）

dom事件调用
事件工作中有两个主体：
- event（事件）
- targetEvent（目标事件）

事件对象
- event.target 触发事件的对象，出现在事件的**目标阶段**
- event.currentTarget  绑定事件的对象，出现在事件的**任何阶段**

## 第6章 css

- transform 变形
    - 平移、旋转、缩放、扭曲
- transition 变换（过渡）
    - 属性从一个值过渡到另一个值的：过程时间、启动过程、延迟时间、结束方式等
- animation 动画
    - keyframes（关键帧）


webkit中css规则的表示
```js
StyleRules: {
    CSSSelector: ['a', '[class=abc]'], // css选择器列表
    CSSPropertySet: { // 属性集合SET
        CSSPropertyId: CSSValue // 属性键值对
        CSSPropertyId1: CSSValue // 属性键值对
        ...
    }
}
```

css的解析过程：
1. startSelector
2. endSelector
3. startRuleBody
4. startPrpperty
5. parseValue
6. createStyleRule
7. endRuleBody

## 第7章 渲染
- 非可视化节点
- 可视化节点
    - 需要渲染到界面上的节点，会为其创建对象的RenderObject节点

RenderObject通过layout()和style()来计算布局和相关样式

RenderLayer 简化渲染逻辑，分层渲染


绘制方式
- 软件绘制（cpu绘制）
- 硬件绘制（gpu绘制）

renderObject的绘制顺序
1. 绘制背景和边框
2. 绘制浮动内容
3. 绘制前景（内容，轮廓）

### 网页显示的render进程和browser进程交互
render进程：
1. 渲染网页到共享内存
2. 通知browser进程，渲染完成
5. 回收共享内存

共享内存存储位图
    
browser进程：
3. 复制共享内存中的结果到自己对于的存储区，并绘制显示网页
4. 通知render绘制完成


## 第8章 硬件加速

单独的合成层：
- CSS 3d和透视
- video
- canvas的web-gl
- css 透明和变换
- css filters

减少重绘
- 网页分层
- css 3d 变形和动画

2D图像的GPU加速
CSS animations, transforms 以及 transitions 不会自动开启GPU加速，而是由浏览器的缓慢的软件渲染引擎来执行。
- transform.:translateZ(0)
- transform.:translate3d(0,0,0)


## 第9章 js引擎