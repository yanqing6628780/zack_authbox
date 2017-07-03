//migrations入口
require('../../app/initConfig');
var configs = require('y-config').getConfig();
var models = configs.models;

//链接数据库
models.sequelize.sync().then(() => {
    //将需要运行的migrations加在下面
    require('./user.js')(models.sequelize).run();
}).catch(err => {
    console.error('sequelize migrations fail');
    console.error(err);
});
