'use strict';

const fs = require('fs');
const fn = require('../utils/fn.js');
const db = require('../utils/lowdb.js');
const moment = require('moment');
const config = require('y-config').getConfig();
const apiLowdb = require('./api/common/initMemDB')();
const User = config.models.user;

module.exports = function() {
    var exports = {};

    var alipay = config.alipay;
    alipay.rsaPrivate = fs.readFileSync(__dirname + '/../../pem/sandbox_ali_private.pem', 'utf-8');
    alipay.rsaPublic = fs.readFileSync(__dirname + '/../../pem/sandbox_ali_public.pem', 'utf-8');
    alipay.notifyUrl = config.domainUrl + '/alipay/notify';
    alipay.geteWay = alipay.sandBox ? alipay.gate_way_sandbox : alipay.gate_way;

    const seller = {
        id: alipay.seller_id,
        price: alipay.price
    };

    exports.pay = (req, res, next) => {
        if (!req.query.token) {
            return next(new Error('非法请求'));
        }

        let id_card = apiLowdb.getIdcard4Token(req.query.token);

        if (!id_card) {
            return next(new Error('请登录后操作'));
        }

        //订单号
        let outTradeId = moment().format('YYYYMMD') + Math.random().toString().substr(2, 10);
        //公共参数
        let params = {
            app_id: alipay.appId,
            method: 'alipay.trade.wap.pay',
            charset: 'utf-8',
            sign_type: 'RSA2',
            format: 'JSON',
            notify_url: alipay.notifyUrl,
            return_url: config.domainUrl + '/member/',
            timestamp: moment().format('YYYY-MM-DD hh:mm:ss'),
            version: '1.0'
        };

        //商品信息
        let biz_content = {
            body: '会员升级大乐透',
            subject: '会员升级',
            out_trade_no: outTradeId,
            timeout_express: '5m',
            total_amount: seller.price,
            product_code: 'QUICK_WAP_PAY'
        };
        params.biz_content = JSON.stringify(biz_content);

        let rs = fn.encodeParams(params);
        //生成签名
        let sign = fn.sign(rs.unencode, alipay.rsaPrivate, alipay.signType);
        // urlencode签名
        let urlEncodeParams = rs.unencode + '&sign=' + encodeURIComponent(sign);

        db.get('alipay').push({
            total_amount: seller.price,
            out_trade_no: outTradeId,
            id_card: id_card
        }).write();

        res.render('alipay', {
            ali_url: alipay.geteWay + '?' + urlEncodeParams
        });
    };

    exports.notify = (req, res) => {
        let params = req.query;

        let trade_no = req.query.trade_no; //支付宝交易号
        let out_trade_no = req.query.out_trade_no; //获取订单号

        let seller_id = req.query.seller_id;
        let trade_status = req.query.trade_status;

        let cpParams = JSON.parse(JSON.stringify(params));
        delete cpParams.sign;
        delete cpParams.sign_type;

        let tmp = fn.encodeParams(cpParams);
        let isSign = fn.signVerify(
            tmp.unencode,
            params.sign,
            alipay.rsaPublic, alipay.signType
        );
        if (isSign) {
            let order = db.get('alipay').find({ out_trade_no: out_trade_no });
            if(order.length === 0) {
                res.send('fail');
            }
            if(order[0].total_amount != seller.price) {
                res.send('fail');
            }
            if(seller_id != seller.id) {
                res.send('fail');
            }
            if(req.query.app_id != alipay.appId) {
                res.send('fail');
            }
            if (trade_status == 'TRADE_SUCCESS' || trade_status == 'TRADE_FINISHED') {
                if(!order[0].trade_status) {
                    order.assign({
                        trade_status: trade_status,
                        trade_no: trade_no
                    }).write();
                    let rs = db.getByOutTradeNo(out_trade_no);

                    User.update({ level: 1 }, {
                        where: {
                            id_card: rs.id_card
                        }
                    }).then(() => {
                        res.send('success');
                    }).catch(() => {
                        res.send('fail');
                    });
                } else {
                    res.send('fail');
                }

            }

            res.send('success');
        } else {
            res.send('fail');
        }
    };

    return exports;
};
