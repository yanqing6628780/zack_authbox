'use strict';

module.exports = function(app, passport) {
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
            if (req.session.admin) return next();

            res.redirect('/admin/login');
        },
        checkAuthorization: (purview) => {
            return (req, res, next) => {
                if (req.session.admin.admin_role[purview]) {
                    return next();
                } else {
                    return  next('权限不足');
                }
            }
        }
    }

    return exports;
}
