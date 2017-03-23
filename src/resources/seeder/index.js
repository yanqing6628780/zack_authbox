//seeder入口
var mongoose = require('mongoose');
var config = require('authbox-config')();

//链接数据库
var mongodbUri = 'mongodb://' + config.db.host + '/' + config.db.name;

mongoose.connect(mongodbUri, function(err, res) {
    if (err) {
        console.log('ERROR connecting to: ' + mongodbUri + '. ' + err);
    } else {
        console.log('Succeeded connected to: ' + mongodbUri);
    }
});

//将需要运行的seeder加在下面
require('./user.js')(config).run();
require('./oauth.js')(config).run();
