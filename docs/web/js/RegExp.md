# 正则表达式

## 常用正则
```js
// 限制用户输入：数字 + 字母 + 中文
 event.target.value = event.target.value.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')

```