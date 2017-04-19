const lowdb = require('lowdb');
const fileAsync = require('lowdb/lib/storages/file-async');
const db = lowdb('db.json', {
  storage: fileAsync
});

module.exports = (() => {
    db.defaults({
        alipay: [ ]
    }).write();

    db.getByOutTradeNo = (out_trade_no = '') => {
        let objs = lowdb.get('alipay')
            .filter({
                'out_trade_no': out_trade_no
            })
            .value();
        return objs.length !== 0 ? objs[0] : null;
    };

    return db;
})();
