'use strict';

// const local = require('./passport/local');
const github = require('../passport/github');
const local = require('../passport/local');
const weibo = require('../passport/weibo');
const qq = require('../passport/qq');

module.exports = function(app, passport) {
    var User = require(app.configs.path.models + '/user_schema.js');

    // serialize sessions
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // use these strategies
    passport.use(local(app));
    passport.use(github(app));
    passport.use(weibo(app));
    passport.use(qq(app));

    return passport;
};
