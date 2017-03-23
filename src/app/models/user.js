"use strict";

const bcrypt = require('bcrypt-nodejs');
const SALT_WORK_FACTOR = 10;

module.exports = function(sequelize, DataTypes) {
    var reasons = {
        FAIL: 0,
        MAX_ATTEMPTS: 1,
        BAN: 2
    };
    var User = sequelize.define("user", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        id_card: {
            type: DataTypes.STRING(18),
            allowNull: false,
            primaryKey: true,
            unique: true
        },
        username: {
            type: DataTypes.STRING(32),
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(64),
            allowNull: false,
            default: ''
        },
        email: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        gender: {
            type: DataTypes.ENUM,
            values: ['男', '女', '保密']
        },
        age: {
            type: DataTypes.INTEGER.UNSIGNED
        },
        address: {
            type: DataTypes.STRING(256)
        },
        phone: {
            type: DataTypes.STRING(11)
        },
        name: {
            type: DataTypes.STRING(8)
        }
    }, {
        classMethods: {
            getFailReasons: function() {
                return reasons;
            },
            getAuthenticated: function(candidate, callback) {
                this.findOne({
                    where: {
                        username: candidate.username
                    }
                }).then(function(user) {
                    if (!user) {
                        return callback(null, null, reasons.FAIL);
                    }

                    bcrypt.compare(candidate.password, user.password,
                        function(err, isMatch) {
                            if (err) {
                                return callback(err, null, reasons.FAIL);
                            }
                            if (isMatch) {
                                if (user.isban) {
                                    return callback(null, null, reasons.BAN);
                                } else {
                                    return callback(null, user);
                                }
                            } else {
                                return callback(null, null, reasons.FAIL);
                            }
                        });
                }).catch(function(err) {
                    return callback(err, null, reasons.FAIL);
                });
            }
        }
    });

    return User;
};
