'use strict';

const GithubStrategy = require('passport-github2').Strategy;
const utils = require('./utils.js');

module.exports = function(app) {
    var githubConfig = app.configs.github;
    var User = require(app.configs.path.models + '/user_schema.js');

    var exports = new GithubStrategy({
            clientID: githubConfig.clientID,
            clientSecret: githubConfig.clientSecret,
            callbackURL: app.configs.domainUrl + githubConfig.callbackURL,
            passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {

            if (app.get('env') === 'development') {
                app.log.dateLogger.info('github profile:');
                app.log.dateLogger.info(profile);
            }

            if (!profile.emails || !profile.emails[0].value) {
                req.flash('warning', '没有有效邮箱');
                return done(null, false);
            }

            var conditions = {
                email: profile.emails[0].value
            };

            User.findOne(conditions).exec().then(function(user) {
                if (!!user === true && user.provider === 'github') {
                    return utils.checkUserIsBan(req, user, done);
                } else {
                    var data = {
                        email: profile.emails[0].value,
                        username: profile.emails[0].value,
                        nickname: profile.displayName ? profile.displayName : profile.username,
                        provider: profile.provider,
                        user_type: 'user',
                    };
                    var newUser = new User(data);
                    newUser.save(function(err) {
                        if (err) {
                            app.log.modelsLogger.error('github profile findOne create user:');
                            app.log.modelsLogger.error(err);
                            return done(err);
                        }
                        return done(null, newUser);
                    });
                }
            }).catch(function(err) {
                app.log.modelsLogger.error('github profile findOne:');
                app.log.modelsLogger.error(err);
                return done(err);
            });
        }
    );

    return exports;
}
