'use strict';

var path = require('path');
var glob = require("glob");
var express = require('express');
var cors = require('cors');
var crypto = require('crypto');
var oauthServer = require('oauth2-server');
var Request = oauthServer.Request;
var Response = oauthServer.Response;

module.exports = function(app, passport) {
    var configs = app.configs;

    var controllersDir = __dirname + '/controllers/',
        controllersFile = glob.sync(controllersDir + "**/*.js"),
        controllers = new Object,
        middlewaresDir = __dirname + '/middlewares/',
        middlewaresFile = glob.sync(middlewaresDir + "**/*.js"),
        middlewares = new Object;

    //加载控制器
    controllersFile.forEach(function(file, index) {
        var parse = path.parse(file);
        var secondaryDir = path.basename(parse.dir);
        if (secondaryDir !== 'controllers') {
            if (!controllers[secondaryDir]) {
                controllers[secondaryDir] = new Object;
            }
            controllers[secondaryDir][parse.name] = require(file)(app);
        } else {
            controllers[parse.name] = require(file)(app);
        }
    });
    //加载中间件
    middlewaresFile.forEach(function(file) {
        var key = path.basename(file, '.js');
        middlewares[key] = require(file)(app, passport);
    });

    if (app.get('env') === 'development') {
        console.log(controllers);
        console.log(middlewares);
        console.log(passport);
    }

    var localCtrl = controllers.auth.local;
    var adminCtrl = controllers.admin;
    var midAuth = middlewares.authorization;
    var passportOptions = {
        successRedirect: '/auth/success',
        failureRedirect: '/login',
    };

    var routerPage = express.Router();

    //routerPage下的views上使用下面的数据
    routerPage.use(function(req, res, next) {
        res.locals.path = req.path;
        res.locals.user = req.user ? req.user : null;
        next(null, req, res);
    });

    routerPage.get('/', controllers.index.home);

    routerPage.get('/register', localCtrl.register);
    routerPage.post('/register', localCtrl.doRegister);
    routerPage.get('/login', localCtrl.login);
    routerPage.post('/login', passport.authenticate('local', passportOptions));
    routerPage.get('/logout', localCtrl.logout);

    //登录成功页
    routerPage.get('/auth/success', localCtrl.success);

    //后台鉴权
    routerPage.use(['/admin', '/admin/*'], midAuth.admin.hasAuthorization);
    //后台管理路由
    routerPage.get('/admin/', adminCtrl.index.home);
    routerPage.get('/admin/users', adminCtrl.user.list);
    routerPage.get('/admin/users/add', adminCtrl.user.add);
    routerPage.get('/admin/users/edit/:id', adminCtrl.user.edit);
    routerPage.post('/admin/users/save', adminCtrl.user.save);
    routerPage.get('/admin/users/delete/:id', adminCtrl.user.del);

    // catch 404 and forward to error handler
    routerPage.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        routerPage.use(function(err, req, res, next) {
            app.log.dateLogger.error('链接:' + req.originalUrl + ' 应用错误');
            app.log.dateLogger.error(err);
            if (res.headersSent) {
                return next(err);
            }
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    routerPage.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

    //接口路由
    // var routerApi = express.Router();
    // var apiCtrl = controllers.api;

    // var oauth = new oauthServer({
    //     accessTokenLifetime: configs.Oauth.accessTokenLifetime,
    //     model: require(app.configs.path.models + 'oauth'),
    //     grants: ['password', 'authorization_code', 'refresh_token'],
    //     debug: true
    // });

    // //获取oauth token
    // app.all('/oauth/token', oauth.grant(), oauth.errorHandler());

    // //以下routerApi都需要access_token鉴权
    // routerApi.use(oauth.authorise());

    // // routerApi.get('/users/', apiCtrl.user.list);
    // routerApi.get('/user/', apiCtrl.user.detail);
    // routerApi.post('/users/:id', apiCtrl.user.update);
    // routerApi.post('/auth/login', apiCtrl.auth.doLogin);

    // routerApi.use(oauth.errorHandler());

    // app.use('/api/v1', routerApi);

    app.use('/', routerPage);
}
