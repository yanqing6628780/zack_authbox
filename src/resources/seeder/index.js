//seeder入口
require('../../app/initConfig')
var configs = require('y-config').getConfig();
var models = configs.models;

//链接数据库
models.sequelize.sync().then(() => {
    //将需要运行的seeder加在下面
    require('./admin.js')(models).run();
}).catch(() => {
    console.error('sequelize sync fail');
});
