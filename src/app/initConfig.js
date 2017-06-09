'use strict';

let config = require('y-config');
config.setConfigPath(__dirname + '/../config/app.example.yaml');
config.setCustomConfigPath(__dirname + '/../config/app.yaml');

const configs = config;

let initConfig = () => {

    //设置资源文件夹绝对路径
    const pathArr = ['views', 'models', 'public', 'resource', 'logs'];
    pathArr.forEach(path => {
        configs[path] = `${__dirname}/../${configs[path]}`;
    });
    configs.models = require(configs.models);

    require('./utils/getIp.js');

    return true
}

module.exports = initConfig();
