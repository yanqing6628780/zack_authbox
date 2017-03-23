'use strict';

module.exports = function(app) {
    var User = require(app.configs.path.models + '/user_schema.js');

    var exports = {};
    exports.list = function(req, res, next) {
        var findResult = User.find()
            .exec()
            .then(function(result) {
                res.render('admin/users', {
                    title: '管理后台用户',
                    list: result
                });
            }).catch(function(err) {
                return next(err);
            });
    }

    exports.add = function(req, res, next) {
        res.render('admin/users/form', {
            title: '管理后台用户-添加',
        });
    }

    exports.edit = function(req, res, next) {
        if (req.params.id) {
            User.findOne({ _id: req.params.id }).exec()
                .then(function(user) {
                    res.render('admin/users/form', {
                        title: '管理后台用户-编辑',
                        model: user
                    });
                }).catch(function(err) {
                    return next(err);
                });
        } else {
            return res.status(404).send('Not found');
        }
    }

    exports.save = function(req, res, next) {
        if (req.body.id) {
            User.findOne({ _id: req.body.id })
                .exec()
                .then(function(user) {

                    if (req.body.password.length === 0) {
                        delete req.body.password;
                    }

                    for (var key in req.body) {
                        user[key] = req.body[key];
                    }

                    console.log('admin user edit find result:', user);

                    user.save()
                        .then(function(rs) {
                            if (app.get('env') === 'development') {
                                console.log('admin user edit save result:', rs);
                            }
                            res.redirect('/admin/users');
                        }).catch(function(err) {
                            return next(err);
                        });
                }).catch(function(err) {
                    return next(err);
                });
        } else {
            var newUser = new User(req.body);

            // save user to database
            newUser.save()
                .then(function(rs) {
                    if (app.get('env') === 'development') {
                        console.log('admin new user save result:', rs);
                    }
                    res.redirect('/admin/users');
                }).catch(function(err) {
                    return next(err);
                });
        }
    }

    exports.del = function(req, res, next) {
        if (req.params.id) {
            User.remove({ _id: req.params.id }, function(err) {
                if (err) {
                    next(err);
                }
            });
        }
        res.redirect('/admin/users');
    }

    return exports;
}
