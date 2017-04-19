'use strict';

const lowdb = require('lowdb')();

module.exports = () => {
    lowdb.defaults({
        tokens: [],
        forgets: []
    }).write();

    lowdb.getIdcard4Token = (token = '') => {
        let objs = lowdb.get('tokens')
            .filter({
                'token': token
            })
            .value();
        return objs.length !== 0 ? objs[0].id_card : null;
    };

    return lowdb;
};
