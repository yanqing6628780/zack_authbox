'use strict';

module.exports = function(app) {
    var models = require('y-config').getConfig().models;
    var User = models.admin;

    var exports = {};
    exports.list = function(req, res, next) {
        User.findAll({
            where: {
                adminRoleId: { gt: 1 }
            }
        }).then(function(result) {
            res.render('admin/users/index', {
                title: '后台管理员',
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
            User.findById(req.params.id)
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

    exports.set = {
        password_view: (req, res, next) => {
            res.render('admin/users/form', {
                title: '管理后台-密码设置',
                model: req.session.admin
            });
        },
        password: (req, res, next) => {
            let candidate = {
                username: req.body.username,
                password: req.body.old_password
            };
            if (req.body.new_password == '') {
                req.flash('errors', '新密码不能为空');
                return res.redirect('back');
            }
            if (req.body.new_password !== req.body.confirm_password) {
                req.flash('errors', '新密码和确认密码不一致');
                return res.redirect('back');
            }
            User.getAuthenticated(candidate, (err, user, reason) => {
                if (err) return next(err);
                if (user) {
                    user.update({
                        password: req.body.new_password
                    }).then(() => {
                        req.flash('success', '修改密码成功');
                        return res.redirect('back');
                    });
                } else {
                    var reasons = User.getFailReasons();
                    switch (reason) {
                        case reasons.FAIL:
                            req.flash('errors', '原密码错误');
                            return res.redirect('back');
                            break;
                    }
                }
            });
        }
    }

    exports.reset = function(req, res, next) {
        User.update({
            password: '123456'
        }, {
            where: {
                id: req.params.id
            }
        }).then(() => {
            req.flash('success', '修改密码成功');
            return res.redirect('back');
        }).catch((err) => {
            return next(err);
        });
    }

    return exports;
}
