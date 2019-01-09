# 文件下载处理
1. 设置[responseType](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/responseType)为'arraybuffer'
2. 获取返回的arrayBuffer数据流
3. new Blob(arrayBuffer)得到Blob对象
4. URL.createObjectURL(blob)得到blob地址
5. window.open(blobUrl)
```js
const response = await this.http.post(url, params, {
    responseType:'arraybuffer'
})
const blob = new Blob(response.data)
window.open(URL.createObjectURL(blob))
```