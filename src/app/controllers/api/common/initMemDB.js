'use strict';

const lowdb = require('lowdb')();

module.exports = () => {
    lowdb.defaults({
        tokens: [ ],
        forgets: [ ]
    }).write();
    return lowdb;
};
