# 常用命令
- 查看配置文件位置
```
nginx -t 
```
- 配置文件重启
```
nginx -s reload
```

- 开启gzip压缩
``` shell
        gzip on;
        #不压缩临界值，大于1K的才压缩，一般不用改
        gzip_min_length 10k;
        #buffer，就是，嗯，算了不解释了，不用改
        gzip_buffers 4 16k;
        #用了反向代理的话，末端通信是HTTP/1.0,默认是HTTP/1.1
        #gzip_http_version 1.0;
        #压缩级别，1-10，数字越大压缩的越好，时间也越长，看心情随便改吧
        gzip_comp_level 5;
        #进行压缩的文件类型，缺啥补啥就行了，JavaScript有两种写法，最好都写上吧，总有人抱怨js文件没有压缩，其实多写一种格式application/javascript 就行了
        gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
        #跟Squid等缓存服务有关，on的话会在Header里增加"Vary: Accept-Encoding"
        gzip_vary off;
        #IE6对Gzip不怎么友好，不给它Gzip了
        gzip_disable "MSIE [1-8]\.";
```

- https证书配置
```shell
server {
        listen 443 ssl;
        server_name www.domain.com; #绑定证书的域名

        ssl_certificate 1_www.domain.com_bundle.crt;
        ssl_certificate_key 2_www.domain.com.key;
        ssl_session_timeout 5m;
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2; #协议配置
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;#套件配置
        ssl_prefer_server_ciphers on;

        location / {
            root   html; #站点目录
            index  index.html index.htm;
        }
}

# 需要将80端口的http重定向到https     rewrite ^(.*) https://$server_name$1 permanent;
```