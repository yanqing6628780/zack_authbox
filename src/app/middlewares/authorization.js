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
            var user = req.user;
            if (user && user.user_type === 'admin') return next();
            res.redirect('/login');
        }
    }

    return exports;
}
