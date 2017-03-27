'use strict';

const LocalStrategy = require('passport-local').Strategy;
const configs = require('y-config').getConfig();

module.exports = function() {
    var models = configs.models;
    var User = models.user;
    var exports = new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback : true
        },
        function(req, username, password, done) {
            const criteria = { username: username, password: password };
            User.getAuthenticated(criteria, function(err, user, reason) {
                if (err) return done(err);
                if (user) {
                    return done(null, user);
                } else {
                    var reasons = User.getFailReasons();
                    switch (reason) {
                        case reasons.FAIL:
                            req.flash('errors', '用户名或密码错误');
                            return done(null, false);
                            break;
                        case reasons.MAX_ATTEMPTS:
                            // send email or otherwise notify user that account is
                            // temporarily locked
                            req.flash('errors', '登录尝试失败过多');
                            return done(null, false);
                            break;
                        case reasons.BAN:
                            req.flash('errors', '该用户被禁止登录');
                            return done(null, false);
                            break;
                    }
                }
            });
        }
    );

    return exports;
}
