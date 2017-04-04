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

    var localCtrl = controllers.auth.local;
    var adminCtrl = controllers.admin;
    var midAuth = middlewares.authorization;
    var passportOptions = {
        successRedirect: '/auth/success',
        failureRedirect: '/login'
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

    app.use('/', routerPage);
    //后台鉴权
    var adminRouter = express.Router();
    var adminUserRouter = express.Router({ mergeParams: true });
    var adminMemberRouter = express.Router({ mergeParams: true });
    var reviewRouter = express.Router({ mergeParams: true });

    adminRouter.use(
        ['/', '/*'],
        midAuth.admin.hasAuthorization,
        midAuth.admin.globalLocals
    );
    //后台管理路由
    adminRouter.get('/', adminCtrl.index.home);
    adminRouter.route('/login')
        .get(adminCtrl.auth.login)
        .post(adminCtrl.auth.doLogin);
    adminRouter.get('/logout', adminCtrl.auth.logout);

    //后台用户管理
    adminRouter.use('/users', adminUserRouter);
    adminUserRouter.get(
        '/',
        midAuth.admin.checkAuthorization('reset_admin_password'),
        adminCtrl.user.list
    );
    adminUserRouter.get('/add', adminCtrl.user.add);
    adminUserRouter.get('/edit/:id', adminCtrl.user.edit);
    // adminUserRouter.get('/admin/users/delete/:id', adminCtrl.user.del);
    // adminUserRouter.post('/admin/users/save', adminCtrl.user.save);
    adminUserRouter.get(
        '/set/password',
        adminCtrl.user.set.password_view
    );
    adminUserRouter.post(
        '/set/password',
        adminCtrl.user.set.password
    );
    adminUserRouter.get(
        '/reset/:id',
        midAuth.admin.checkAuthorization('reset_admin_password'),
        adminCtrl.user.reset
    );

    adminRouter.use('/member', adminMemberRouter);
    adminMemberRouter.get('/', adminCtrl.member.list);
    adminMemberRouter.get(
        '/add', midAuth.admin.checkAuthorization('add_user'),
        adminCtrl.member.add
    );
    adminMemberRouter.get(
        '/:id/edit',
        midAuth.admin.checkAuthorization('edit_user'),
        adminCtrl.member.edit
    );
    adminMemberRouter.get(
        '/:id/delete',
        midAuth.admin.checkAuthorization('del_user'),
        adminCtrl.member.del
    );
    adminMemberRouter.post(
        '/save',
        midAuth.admin.checkAuthorization('add_user'),
        adminCtrl.member.save
    );
    adminMemberRouter.put(
        '/save',
        midAuth.admin.checkAuthorization('edit_user'),
        adminCtrl.member.save
    );
    adminMemberRouter.all('/search', adminCtrl.member.search);
    adminMemberRouter.get(
        '/:id/reset',
        midAuth.admin.checkAuthorization('reset_user_password'),
        adminCtrl.member.reset
    );
    adminMemberRouter.get(
        '/:id/downgrade',
        midAuth.admin.checkAuthorization('special_edit_user'),
        adminCtrl.member.downgrade
    );
    adminMemberRouter.get(
        '/:id/ban',
        midAuth.admin.checkAuthorization('special_edit_user'),
        adminCtrl.member.ban
    );

    adminRouter.use(
        '/review',
        midAuth.admin.checkAuthorization('review_user'),
        reviewRouter
    );
    reviewRouter.get('/', adminCtrl.review.list);
    reviewRouter.get('/:id/pass', adminCtrl.review.pass);
    reviewRouter.get('/:id/reject', adminCtrl.review.reject);

    app.use('/admin', adminRouter);

    // catch 404 and forward to error handler
    var notFound = (req, res, next) => {
        var err = new Error('Not Found');
        err.status = 404;
        return next(err);
    };

    // error handlers
    var errroHandlers = (err, req, res, next) => {
        // development error handler
        // will print stacktrace
        if (app.get('env') === 'development') {
            console.error('链接:%s 应用错误', req.originalUrl);
            console.error(err);
            if (res.headersSent) {
                return next(err);
            }
        } else {
            app.log.dateLogger.error('链接:' + req.originalUrl + ' 应用错误');
            app.log.dateLogger.error(err);
        }
        // production error handler
        // no stacktraces leaked to user
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    };

    //接口路由
    // var routerApi = express.Router();
    // var apiCtrl = controllers.api;

    // var oauth = new oauthServer({
    //     accessTokenLifetime: configs.Oauth.accessTokenLifetime,
    //     model: require(app.config.models + 'oauth'),
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

    app.use(notFound, errroHandlers);
}
