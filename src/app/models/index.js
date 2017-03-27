"use strict";

var fs = require("fs");
var path = require("path");
var Sequelize = require("sequelize");
var configs = require('y-config').getConfig();
var db = {};
//链接数据库
var sequelize = new Sequelize(configs.db.name, configs.db.username, configs.db.password, {
    host: configs.db.host,
    port: configs.db.port,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

//Checking connection status
sequelize.authenticate().done(function(err) {
    if (err) {
        console.log('There is connection in ERROR');
    } else {
        console.log('sequelize Connection has been established successfully');
    }
});

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        var model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
