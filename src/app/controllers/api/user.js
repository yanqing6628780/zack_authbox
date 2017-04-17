'use strict';

const lodash = require('lodash');
const moment = require('moment');
const md5 = require('md5');
const config = require('y-config').getConfig();

const lowdb = require('./common/initMemDB')();

module.exports = () => {
    var models = config.models;
    var User = models.user;
    // @todo models/oauth.js
    // var Oauth = models.oauth;
    var exports = {};

    const KEY_TABLE = {
      'id_card': '身份证号码',
      'password': '密码',
      'email': 'Email',
      'gender': '性别',
      'address': '地址',
      'phone': '电话',
      'name': '姓名'
    };

    let tokenTableExist = false;
    let hasLoginToken = (token='') => {
        if (!tokenTableExist) {
            if (!lowdb.has('tokens').value()) {
                lowdb.set('tokens', [ ]).write();
            }
            tokenTableExist = true;
        }
        let obj = lowdb.get('tokens').find({
            token: token
        }).value();
        // 不存在Token
        if (!obj) {
            return false;
        }
        // Token 过期的话
        if (moment(obj.overtimeAt).diff(moment(), 'seconds') <= 0) {
            return false;
        }
        return obj;
    };

    exports.actionLogin = (req, res) => {
        if (!req.body.id_card || !req.body.password) {
            return res.json({
                type: 'error',
                msg: `请填写身份证号码和密码.`
            });
        }
        return new Promise((resolve, reject) => {
            let criteria = {
                id_card: req.body.id_card,
                password: req.body.password
            };
            User.getAuthenticated(criteria, (err, user) => {
                if (!user) {
                    return reject(res.json({
                        type: 'error',
                        msg: `不存在该身份证号码`
                    }));
                }
                let objs = lowdb.get('tokens')
                    .filter({
                        'id_card': criteria.id_card
                    })
                    .value();
                for (let i in objs) {
                    let obj = objs[i];

                    if (moment(obj.overtimeAt).diff(moment(), 'seconds') > 0) {
                        return res.json({
                            type: 'ok',
                            content: obj
                        });
                    }
                }
                let curMnt = moment();
                let loginObj = {
                    'id_card': req.body.id_card,
                    'token': md5(`${curMnt.format()}${req.body.id_card}`),
                    'overtimeAt': (
                        curMnt.add(config.accessTokenLifetime, 's').format()
                    )
                };
                lowdb.get('tokens').push(loginObj).write();
                return resolve(res.json({
                    type: 'ok',
                    content: loginObj
                }));
            });
        });
    };

    exports.actionRegister = (req, res) => {
        for(let key in KEY_TABLE) {
          if (!req.body[key]) {
              return res.json({
                  type: 'error',
                  msg: `请填写${KEY_TABLE[key]}.`
              });
          }
        }
        return new Promise((resolve) => {
            User.findOrCreate({
                where: {
                    'id_card': req.body.id_card
                },
                defaults: {
                    'password': req.body.password,
                    'email': req.body.email,
                    'gender': req.body.gender,
                    'address': req.body.address,
                    'phone': req.body.phone,
                    'name': req.body.name
                }
            }).spread(function(user, created) {
                let obj;
                if (created) {
                  obj = {
                      type: 'ok',
                      content: user.get({
                          plain: true
                      })
                  };
                } else {
                  obj = {
                      type: 'error',
                      msg: `该身份证号码已使用.`
                  };
                }
                return resolve(res.json(obj));
            });
        });
    };

    let checkLoginToken = (req, res) => {
        let msg = null;
        if (!req.body.token) {
            msg = `缺失Token 参数.`;
        } else if (hasLoginToken(req.body.token)) {
            msg = `无效Token 参数.`;
        }
        if (!msg) {
            res.json({
                type: 'error',
                msg: msg
            });
            return false;
        }
        return true;
    };
    let getIdcard4Token = (token='') => {
      let objs = lowdb.get('tokens')
          .filter({
              'token': token
          })
          .value();
      return objs.length !== 0 ? objs[0].id_card : null;
    };

    exports.actionUpdate = (req, res) => {
        if (!checkLoginToken(req, res)) { return; }
        let arr = lodash.keys(KEY_TABLE);
        let data = { };
        for (let key in arr) {
            let _key = arr[key];
            if (_key == 'id_card' || _key == 'password') {
                continue;
            }
            if (req.body[_key]) {
                data[_key] = req.body[_key];
            }
        }
        if (lodash.keys(data).length === 0) {
            return res.json({
                type: 'error',
                msg: `请输入需要修改的参数`
            });
        }

        User.update(data, {
            where: {
                id_card: getIdcard4Token(req.body.token)
            }
        }).then(() => {
          return res.json({
              type: 'ok',
              msg: '更新信息成功'
          });
        }).catch(() => {
          return res.json({
              type: 'error',
              msg: '更新信息失败'
          });
        });
    };

    exports.actionGetuser = (req, res) => {
        if (!checkLoginToken(req, res)) { return; }
        User.find({
            where: {
                id_card: getIdcard4Token(req.body.token)
            }
        }).then((user) => {
            return res.json({
                type: 'ok',
                content: user.get({
                    plain: true
                })
            });
        });
    };

    let getForgetToken = (req, res) => {
        let objs = lowdb.get('forgets')
            .filter({
                'id_card': req.body.id_card
            })
            .value();
        for (let i in objs) {
            let obj = objs[i];
            if (moment(obj.overtimeAt).diff(moment(), 'seconds') > 0) {
                return res.json({
                    type: 'ok',
                    content: obj
                });
            }
        }
        return User.findOne({
            where: {
                'id_card': req.body.id_card,
                'email': req.body.email
            }
        }).then((user) => {
            if (!user) {
                return res.json({
                    type: 'error',
                    msg: "不存在该身份证号码和该Email的关联组合."
                });
            }

            let curMnt = moment();
            let forgetObj = {
                'id_card': req.body.id_card,
                'email': req.body.email,
                'token': md5(`${curMnt.format()}${req.body.id_card}`),
                'overtimeAt': curMnt.add(config.forgetOversecond, 's').format()
            };
            lowdb.get('forgets').push(forgetObj).write();
            return res.json({
                type: 'ok',
                content: forgetObj
            });

        });
    };
    let resetPassword = (req, res) => {
        let objs = lowdb.get('forgets')
            .filter({
                'id_card': req.body.id_card,
                'token': req.body.token
            })
            .value();
        if (objs.length === 0) {
            return res.json({
                type: 'error',
                msg: '未知Token.'
            });
        }
        let obj = objs[0];
        if (moment(obj.overtimeAt).diff(moment(), 'seconds') <= 0) {
            return res.json({
                type: 'ok',
                content: 'Token 已过期.'
            });
        }
        let data = {
            password: req.body.password
        };
        User.update(data, {
            where: {
                id_card: obj.id_card
            }
        }).then(() => {
          return res.json({
              type: 'ok',
              msg: '设置密码成功.'
          });
        }).catch(() => {
          return res.json({
              type: 'error',
              msg: '设置密码失败.'
          });
        });
    };
    exports.actionForget = (req, res) => {
        let arr = ['id_card', 'email'];
        for(let key in arr) {
            let _key = arr[key];
            if (!req.body[_key]) {
                return res.json({
                    type: 'error',
                    msg: `请填写${KEY_TABLE[_key]}.`
                });
            }
        }
        if (!req.body.token && !req.body.password) {
            return getForgetToken(req, res);
        } else {
            return resetPassword(req, res);
        }

    };

    return exports;
};
