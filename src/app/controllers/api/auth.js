'use strict';

module.exports = function(app) {

    var User = require('y-config').getConfig().models.user;

    var exports = {};

    /**
     * @api {post} /login/ 登录
     * @apiVersion 0.1.0
     * @apiName doLogin
     * @apiGroup Auth
     *
     * @apiParam {String} access_token 令牌.
     * @apiParam {String} id_card 身份证.
     * @apiParam {String} password  密码
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *    {
     *       // 用户资料
     *     }
     *
     *
     *  @apiErrorExample Response(example):
     *      HTTP/ 1.1 200 OK
     *  {
     *      "type": "error"
     *      "msg": "系统繁忙"
     *  }
     *
     */
    exports.doLogin = function(req, res) {
        if (!req.body.id_card || !req.body.password) {
            return res.json({ type: 'error', msg: '请填写用户名和密码' });
        }
        User.getAuthenticated(req.body, function(err, user, reason) {
            if (err) {
                app.log.dateLogger.error('系统出错');
                app.log.dateLogger.error(err);
                return res.json({ type: 'error', msg: '系统繁忙' });
            }
            if (user) {
                return res.json(user);
            } else {
                var reasons = User.failedLogin;
                switch (reason) {
                    case reasons.FAIL:
                        return res.json({ type: 'error', msg: '用户名或密码错误' });
                    case reasons.MAX_ATTEMPTS:
                        return res.json({ type: 'error', msg: '登录尝试失败过多' });
                }
            }
        });
    };

    return exports;
};
