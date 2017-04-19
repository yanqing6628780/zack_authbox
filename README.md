# AuthBox
        
## Start Service

### Development(开发环境)

```  
npm install
cd src
npm install  
gulp -d  
```

### Deploy(生产环境)

```
npm install
gulp
cd dist
npm install
npm start
```

## Get Start
### 配置
在 `config` 目录下有个`app.example.yaml`文件，这是系统的默认配置。  
如果要修改配置，请将该文件复制并重命名为`app.yaml`。系统会使用`app.yaml`内的值替换`app.example.yaml`相同名称的值。  
例如要修改数据库配置，app.yaml内容如下：  

```
db:
  host: 'db.mysql.com'
  username: 'root'
  password: '123456'
```


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
