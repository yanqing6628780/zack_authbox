module.exports = function () {
    var utils = {};

    utils.checkUserIsBan = function (req, user, done) {
        if (user.isban) {
            req.flash('errors', '该用户被禁止登录');
            return done(null, false);
        } else {
            return done(null, user);
        }
    }

    return utils;
}();
