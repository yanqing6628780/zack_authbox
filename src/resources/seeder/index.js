//seeder入口
var configs = require('y-config');

configs.setConfigPath('./src/config/app.example.yaml');
configs.setCustomConfigPath('./src/config/app.yaml');
configs = configs.getConfig();
var models = require('../../' + configs.models);

//链接数据库
models.sequelize.sync().then(function () {
    //将需要运行的seeder加在下面
    require('./admin.js')(models).run();
}).catch(function(){
    console.error('sequelize sync fail');
});

