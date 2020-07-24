## formdata上传
```js
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    console.log(key, value)
    formData.append(key, value)
  })

  return request({
    url: 'crm/bill/batchImportBill',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
```

## 返回文件流下载
```js
    const content = res
    const blob = new Blob([content])
    const fileName = '账单导出.xls'
    if ('download' in document.createElement('a')) { // 非IE下载
      const elink = document.createElement('a')
      elink.download = fileName
      elink.style.display = 'none'
      elink.href = URL.createObjectURL(blob)
      document.body.appendChild(elink)
      elink.click()
      URL.revokeObjectURL(elink.href) // 释放URL 对象
      document.body.removeChild(elink)
    } else { // IE10+下载
      navigator.msSaveBlob(blob, fileName)
    }
```