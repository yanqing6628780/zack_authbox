'use strict';

module.exports = function(app) {
    var exports = {}
    exports.home = function(req, res, next) {
        res.render('index', {
            title: '首页',
            user: req.user
        });
    }

    return exports;
}
