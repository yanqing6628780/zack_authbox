'use strict';

module.exports = function(app) {

    var User = require(app.configs.path.models).user;

    var exports = {};

    exports.register = function(req, res, next) {
        res.render('register', { title: '注册' });
    }

    exports.doRegister = function(req, res, next) {
        req.body.user_type = 'user';

        if (req.body.confirm_password !== req.body.password) {
            req.flash('errors', '密码不一致');
            return res.redirect('back');
        }

        var newUser = new User(req.body);

        // save user to database
        newUser.save(function(err) {
            if (err) {
                for ( var key in err.errors) {
                    req.flash('errors', err.errors[key].message);
                }
                return res.redirect('back');
            }
            req.login(newUser, function(err) {
                if (err) {
                    return next(err);
                }
                res.redirect('/auth/success');
            });
        });
    }

    exports.login = function(req, res, next) {
        res.render('login', { title: '登录' });
    }

    exports.logout = function(req, res, next) {
        req.logout();
        res.redirect('/login');
    }

    exports.success = function(req, res, next) {
        if (!req.isAuthenticated()) {
            return next(new Error('非法操作'));
        }
        res.render('auth/success', { title: '登录成功' });
    }

    return exports;
}
