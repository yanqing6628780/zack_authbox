'use strict';

module.exports = function(app) {
    var config = require('y-config').getConfig();
    var models = config.models;
    var User = models.user;
    var Review = models.review_user;
    var prefix_url = '/admin/member/';
    var exports = {};
    var _countUser = (where) => {
        return User.count({ where: where });
    };
    exports.list = function(req, res) {
        Promise.all([
            _countUser({ level: 1 }),
            _countUser({ level: 0 }),
            _countUser({ is_ban: 1 })
        ]).then((data) => {
            res.render('admin/member/', {
                title: '会员管理',
                countData: data
            });
        });
    };
    exports.search = function(req, res, next) {
        var _findUser = function(where) {
            User.findAll({
                where: where
            }).then(function(result) {
                return _render(result);
            }).catch(function(err) {
                return next(err);
            });
        };
        var _render = function(rs) {
            return res.render('admin/member/search', {
                result: rs,
                prefix_url: prefix_url
            });
        };
        let where = {};
        let _likeFields = ['name', 'phone', 'email', 'address', 'id_card'];
        for (let i = _likeFields.length - 1; i >= 0; i--) {
            let field = _likeFields[i];
            if (req.body[field]) {
                if (field === 'id_card' &&
                    req.body[field].toString().length <= 9
                ) {
                    req.flash('warning', '请至少输入10位身份证号码');
                    return _render([]);
                }
                where[field] = {
                    $like: `%${req.body[field]}%`
                };
            }
        }

        let _normalFields = ['gender', 'age', 'level', 'is_ban'];
        for (let i = _normalFields.length - 1; i >= 0; i--) {
            let field = _normalFields[i];
            if (req.body[field]) {
                let val = req.body[field];
                val = field !== 'gender' ? parseInt(val) : val;
                where[field] = val;
            }
        }

        var ssAdmin = req.session.admin;
        if (!ssAdmin.admin_role.scan_all_user) {
            var filterField = (field) => {
                return (value) => {
                    return value != field;
                };
            };
            var searchFields = _likeFields.concat(_normalFields);

            // 检查是否有搜索字段
            var rs = searchFields.filter(filterField('level')).filter(filterField('is_ban'));
            rs = rs.findIndex(item => {
                return where.hasOwnProperty(item);
            });
            if (rs === -1) {
                return _render([]);
            }
        }

        return _findUser(where);

    };

    exports.add = function(req, res) {
        var isMale = true;
        res.render('admin/member/form', {
            title: '添加会员信息',
            isMale: isMale
        });
    };

    exports.edit = function(req, res, next) {
        if (req.params.id) {
            User.findById(req.params.id)
                .then(function(user) {
                    var isMale = user.gender == 'male' ? true : false;
                    if (user.is_review) {
                        return next('该用户资料审核中');
                    } else {
                        res.render('admin/member/form', {
                            title: '修改会员信息',
                            model: user,
                            isMale: isMale
                        });
                    }
                }).catch(function(err) {
                    return next(err);
                });
        } else {
            return res.status(404).send('Not found');
        }
    };

    exports.save = function(req, res, next) {
        if (req.body.id) {
            req.params.id = req.body.id;
            var reviewFields = ['id_card', 'name'];
            var keyValue = {};
            reviewFields = reviewFields.filter(function(index) {
                return req.body[index] != false;
            });
            reviewFields.forEach(function(elem) {
                keyValue[elem] = req.body[elem];
                delete req.body[elem];
            });
            if (app.locals.adminRole.special_edit_user) {
                User.findOne({ where: { id: req.body.id } })
                    .then((user) => {
                        var _tmp = {};
                        reviewFields.forEach(function(index) {
                            if (user[index] != keyValue[index]) {
                                _tmp[index] = keyValue[index];
                            }
                        });
                        return _tmp;
                    }).then((data) => {
                        if (Object.keys(data).length > 0) {
                            Review.create({
                                key_value: JSON.stringify(data),
                                adminId: req.session.admin.id,
                                userId: req.body.id
                            }).catch((err) => {
                                app.log.modelsLogger.error('写入审核表错误');
                                app.log.modelsLogger.error(err);
                            });
                            req.body.is_review = 1;
                        }
                        return req.body;
                    }).then((params) => {
                        _updateUser(params, '修改会员成功')(req, res, next);
                    });
            } else {
                _updateUser(req.body, '修改会员成功')(req, res, next);
            }
        } else {
            // save user to database
            req.body.password = '12345678';
            User.create(req.body)
                .then(function(rs) {
                    req.flash('success', `添加 身份证:[${rs.id_card}] 会员成功.初始密码为:12345678`);
                    return res.redirect(prefix_url);
                }).catch(function(err) {
                    return next(err);
                });
        }
    };

    exports.del = function(req, res, next) {
        if (req.params.id) {
            User.destroy({ where: { id: req.params.id } }).then(() => {
                req.flash('success', '删除会员成功');
                return res.redirect(prefix_url);
            }).catch((err) => {
                return next(err);
            });
        }
    };

    exports.set = {
        password_view: (req, res) => {
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
                    if (reason.FAIL) {
                        req.flash('errors', '原密码错误');
                        return res.redirect('back');
                    }
                }
            });
        }
    };

    exports.reset = _updateUser({ password: '12345678' },
        '密码重置成功。密码为:12345678'
    );
    exports.downgrade = _updateUser({ level: 0 }, '取消会员成功');

    exports.ban = _updateUser({ is_ban: 1 }, '禁用会员成功');

    function _updateUser(updateData, successTxt) {
        return (req, res, next) => {
            User.update(updateData, {
                where: {
                    id: req.params.id
                }
            }).then(() => {
                req.flash('success', successTxt);
                return res.redirect(prefix_url);
            }).catch((err) => {
                return next(err);
            });
        };
    }

    return exports;
};
