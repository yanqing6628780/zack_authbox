# AuthBox
        
## Start Service

### Development

```  
npm install
cd src
npm install  
gulp -d  
```

### Deploy

```
npm install
gulp
cd dist
npm install
npm start
```

## Get Start


## 目录结构

* src/ 服务器文件
    * bin/www 服务器启动文件
    * app.js express配置
    * /app
    * /app/controllers 控制器
    * /app/middlewares 中间件
    * /app/utils 自己封装的库
    * /app/views 模板
    * /config 配置文件夹
    * /resources 资源文件夹
        * /assets 生成前的静态文件资源js/css/images
            * /images
            * /javascript
            * /stylesheet
        * /seeder 数据库数据填充
        * /theme  前端jade模板.
            * kerwin 第一个模板版本
    * /logs 日志文件夹
    * /public 生成后静态文件资源。页面从这里访问js/css/images/html各类静态资源
        * /images
        * /javascripts
        * /stylesheets
        * /apidoc 接口文档.html
