'use strict';

module.exports = function(app) {
    var config = require('y-config').getConfig();
    var models = config.models;
    var User = models.user;
    var Review = models.review_user;
    var prefix_url = '/admin/review/';
    var exports = {};
    exports.list = function(req, res, next) {
        Review.findAll({
            include: [{
                model: User,
                attributes: ['id_card', 'name']
            }, {
                model: models.admin,
                attributes: ['username']
            }],
            paranoid: true
        }).then((rs) => {
            res.render('admin/review/', {
                title: '审核信息',
                rs: rs,
                prefix_url: prefix_url
            });
        }).catch(err => {
            return next(err);
        });
    };

    exports.pass = _updateReview(true, '审核通过');
    exports.reject = _updateReview(false, '审核拒接成功');

    function _updateReview(isPass, successTxt) {
        return (req, res, next) => {
            Review.findOne({ where: { id: req.params.id } })
                .then((rs) => {
                    var key_value = JSON.parse(rs.key_value);
                    var updateData = {
                        is_review: 0
                    };
                    if(isPass) {
                        for(let key in key_value) {
                            updateData[key] = key_value[key];
                        }
                    }
                    console.log(updateData);
                    User.update(updateData, {
                        where: {
                            id: rs.userId,
                            is_review: 1
                        }
                    }).then((effectRow) => {
                        if(effectRow == 0) {
                            req.flash('warning', '该用户资料不在审核状态');
                        } else {
                            req.flash('success', successTxt);
                        }
                        rs.destroy().then(() => {
                            return res.redirect(prefix_url);
                        });
                    }).catch((err) => {
                        return next(err);
                    });
                });
        };
    }

    return exports;
};
