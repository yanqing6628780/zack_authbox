'use strict';

module.exports = function(app) {
    var config = require('y-config').getConfig();
    var models = config.models;
    var exports = {};
    exports.requiresLogin = function(req, res, next) {
        if (req.isAuthenticated()) return next();
        if (req.method == 'GET') req.session.returnTo = req.originalUrl;
        res.redirect('/login');
    };

    exports.admin = {
        hasAuthorization: function(req, res, next) {
            if (req.path == '/login') return next();
            if (req.path == '/logout') return next();
            if (req.session.admin) {
                app.locals.adminRole = req.session.admin.admin_role;
                return next();
            }

            res.redirect('/admin/login');
        },
        checkAuthorization: (purview) => {
            return (req, res, next) => {
                let adminUser = req.session.admin;
                if (adminUser.admin_role && adminUser.admin_role[purview]) {
                    return next();
                } else {
                    return  next('权限不足');
                }
            };
        },
        globalLocals: (req, res, next) => {
            models.review_user.count().then((data) => {
                app.locals.reviewRowsNumber = data;
                return next();
            });
        }
    };

    return exports;
};
