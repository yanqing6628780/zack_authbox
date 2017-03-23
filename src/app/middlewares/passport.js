'use strict';

const local = require('../passport/local');

module.exports = function(app, passport) {
    var User = require(app.configs.path.models).user;

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
    passport.use(local());

    return passport;
};
