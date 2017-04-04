//seeder入口
require('../../app/initConfig');
var configs = require('y-config').getConfig();
var models = configs.models;

//链接数据库
Promise.all([
    models.sequelize.dropSchema('admins'),
    models.sequelize.dropSchema('admin_roles')
]).then(() => {
    models.sequelize.sync().then(() => {
        //将需要运行的seeder加在下面
        require('./role.js')(models).run();
        require('./admin.js')(models).run();
    }).catch(err => {
        console.error('sequelize sync fail');
        console.error(err);
    });
});
