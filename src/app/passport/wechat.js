'use strict';

const WechatStrategy = require('passport-wechat').Strategy;
const utils = require('./utils.js');
const provider = 'wechat';

module.exports = function(app) {
    var config = app.configs.wechat;
    var User = require(app.configs.path.models + '/user_schema.js');

    var exports = new WechatStrategy({
            appID: config.clientID,
            appSecret: config.clientSecret,
            callbackURL: app.configs.domainUrl + config.callbackURL,
            passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, expires_in, done) {
            app.log.dateLogger.info(provider + ' Strategy:');
            app.log.dateLogger.info(profile);
            if (!profile.emails || !profile.emails[0].value) {
                req.flash('warning', '没有有效邮箱');
                return done(null, false);
            }

            var conditions = {
                email: profile.emails[0].value
            };

            User.findOne(conditions).exec().then(function(user) {
                if (!!user === true && user.provider === provider) {
                    return utils.checkUserIsBan(req, user, done);
                } else {
                    var data = {
                        email: profile.emails[0].value,
                        username: profile.username,
                        nickname: profile.displayName ? profile.displayName : profile.username,
                        provider: profile.provider,
                        user_type: 'user',
                    };
                    var newUser = new User(data);
                    newUser.save(function(err) {
                        if (err) {
                            app.log.dateLogger.info(provider + ' Strategy create user Error:');
                            app.log.dateLogger.info(err);
                            return done(err);
                        }
                        return done(null, newUser);
                    });
                }
            }).catch(function(err) {
                app.log.dateLogger.info(provider + 'Strategy findOne Error:');
                app.log.dateLogger.info(err);
                return done(err);
            });
        }
    );

    return exports;
}
