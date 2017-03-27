'use strict';

const local = require('../passport/local');

module.exports = function(app, passport) {
    var models = require('y-config').getConfig().models;
    var User = models.user;
    var adminUser = models.admin;

    // serialize sessions
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id)
            .then(_user => done(null, _user))
            .catch(err => done(err));
    });

    // use these strategies
    passport.use('local', local());

    return passport;
};
