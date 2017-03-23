'use strict';

module.exports = function(app) {
    var models = require(app.configs.path.models);
    var User = models.user;
    // @todo models/oauth.js
    // var Oauth = models.oauth;
    var exports = {};

    /**
     *   @api {get} /users/ 获取用户列表
     *   @apiVersion 0.1.0
     *   @apiName list
     *   @apiGroup users
     *
     *   @apiParam {String} access_token 令牌.
     *
     *   @apiSuccessExample Success-Response:
     *   HTTP/1.1 200 OK
     *   {
     *       // 用户列表
     *   }
     *
     *
     *   @apiErrorExample Response(example):
     *   HTTP/ 1.1 200 OK
     *   {
     *       "type": "error"
     *       "msg": "系统繁忙"
     *   }
     *
     */
    exports.list = function(req, res) {
        User.find().select('-password').exec()
            .then(function(result) {
                return res.json(result);
            })
            .catch(function(err) {
                app.log.modelsLogger.error('出错');
                app.log.modelsLogger.error(err);
                return res.json({ type: 'error', msg: '系统繁忙' });
            });
    }

    /**
    *   @api {get} /user/ 获取用户资料
    *   @apiVersion 0.1.0
    *   @apiName detail
    *   @apiGroup users
    *
    *   @apiParam {String} access_token 令牌.
    *
    *   @apiSuccessExample Success-Response:
    *   HTTP/1.1 200 OK
    *   {
    *       "_id": "581ff91eab827f4aec48eabc",
    *       "updatedAt": "2016-11-07T03:46:38.666Z",
    *       "createdAt": "2016-11-07T03:46:38.666Z",
    *       "username": "admin",
    *       "__v": 0,
    *       "provider": "",
    *       "usergroup": [],
    *       "user_type": "admin",
    *       "phone": "12345678990",
    *       "nickname": "管理员",
    *       "email": "admin@admin.com"
    *   }
    *
    *
    *   @apiErrorExample Response(example):
    *   HTTP/ 1.1 200 OK
    *   {
    *       "type": "error"
    *       "msg": "系统繁忙"
    *   }
    *
    */
    exports.detail = function(req, res) {
        Oauth.getAccessToken(req.query.access_token, function(err, result) {
            if (err) {
                console.log('get user detail:',err);
                return res.json({ type: 'error', msg: '系统繁忙' });
            }
            if (result) {
                User.findOne({ _id: result.userId }).select('-password').exec()
                    .then(function(result) {
                        if (result.isban) {
                            return res.json({ type: 'error', msg: '用户被禁用' });
                        } else {
                            return res.json(result);
                        }
                    })
                    .catch(function(err) {
                        app.log.modelsLogger.error('获取用户资料出错:');
                        app.log.modelsLogger.error(err);
                        return res.json({ type: 'error', msg: '获取用户资料失败' });
                    });
            } else {
                return res.json({ type: 'error', msg: '没有这个 access token' });
            }
        })
    }

    /**
    *   @api {post} /users/:id 更新用户usergroup
    *   @apiVersion 0.1.0
    *   @apiName update
    *   @apiGroup users
    *
    *   @apiParam {String} access_token 令牌.
    *   @apiParam {Array} usergroup[] 用户组.
    *
    *   @apiSuccessExample Success-Response:
    *   HTTP/1.1 200 OK
    *   {
    *       // 更新成功后的用户资料
    *   }
    *
    *
    *   @apiErrorExample Response(example):
    *   HTTP/ 1.1 200 OK
    *   {
    *       "type": "error"
    *       "msg": "系统繁忙"
    *   }
    *
    */
    exports.update = function(req, res) {
        if (!req.body['usergroup[]']) {
            return res.json({ type: 'error', msg: '请提交数据' });
        }
        User.findOne({ '_id': req.params.id }).select('-password').exec()
            .then(function(result) {
                result.usergroup = req.body['usergroup[]'];
                result.save(function(err) {
                    app.log.modelsLogger.error('出错');
                    app.log.modelsLogger.error(err);
                });

                return res.json(result);
            })
            .catch(function(err) {
                app.log.modelsLogger.error('出错');
                app.log.modelsLogger.error(err);
                return res.json({ type: 'error', msg: '系统繁忙' });
            });
    }

    return exports;
}
