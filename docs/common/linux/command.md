# 常用命令

## scp 
在`linux`下一般用`scp`（secure copy）这个命令来通过ssh传输文件。
- 从服务器上下载文件
- 上传本地文件到服务器
- 从服务器下载整个目录
- 上传目录到服务器

```bash
scp [params] _source _target
```

### 参数说明
| 参数 | 说明 |
|-|-|
|-1|强制scp命令使用协议ssh1。|
|-2|强制scp命令使用协议ssh2。|
|-4|强制scp命令只使用IPv4寻址。|
|-6|强制scp命令只使用IPv6寻址。|
|-B|使用批处理模式（传输过程中不询问传输口令或短语）。|
|-C|允许压缩。（将-C标志传递给ssh，从而打开压缩功能）。|
|**-P port**|指定传输端口。|
|-S program|指定加密传输时所使用的程序。此程序必须能够理解ssh(1)的选项。|
|-F ssh_config|指定一个替代的ssh配置文件。|
|-p|保留原文件的修改时间，访问时间和访问权限。|
|-q|不显示传输进度条。|
|**-r**|递归复制整个目录。|
|-v|显示详细的传输方式。|
|-c cipher|以cipher将数据传输进行加密。|
|-i identity_file|从指定文件中读取传输时使用的密钥文件。|
|-l limit|限制传输速度。|
|-o ssh_option|如果习惯于使用ssh_config(5)中的参数传递方式。|


### 基本用法

```bash
# 上传文件
scp ./index.html root@212.64.89.247:/root/www/cms/
scp ./index.html root@212.64.89.247:/root/www/cms/index.html

# 上传文件夹
scp -r ./* root@212.64.89.247:/root/www/cms/

# 下载文件
scp -r root@212.64.89.247:/root/www/cms/index.html  ./
scp -r root@212.64.89.247:/root/www/cms/index.html  ./index.html

# 下载文件夹
scp -r root@212.64.89.247:/root/www/cms/*  ./

```