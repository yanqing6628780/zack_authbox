"use strict";

const bcrypt = require('bcrypt-nodejs');
const fn = require('../utils/fn');

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
            validate: {
                icLen: (value, next) => {
                    if(value.length != 15 && value.length != 18) {
                        next('身份证号必须是15位或18位');
                    }
                    next();
                },
                isUnique: (value, next) => {
                    var self = this;
                    User.findOne({
                        where: { id_card: value},
                        attributes: ['id']
                    }).then((user) => {
                        if(user && parseInt(self.id) !== user.id) return next('该身份证已经存在');
                        next();
                    }).catch((err) => {
                        next(err);
                    });
                }
            }
        },
        password: {
            type: DataTypes.STRING(60),
            allowNull: false,
            set: function(val) {
                val = bcrypt.hashSync(val.trim());
                this.setDataValue('password', val);
            }
        },
        email: {
            type: DataTypes.STRING(128),
            allowNull: false,
            validate: {
                isEmail: {
                    msg: 'email格式不正确'
                }
            }
        },
        gender: {
            type: DataTypes.ENUM,
            values: ['male', 'female', 'secret']
        },
        age: {
            type: DataTypes.VIRTUAL,
            get: function() {
                let id_card = this.getDataValue('id_card');
                if(id_card) {
                    return fn.getIDCardAge(id_card);
                } else {
                    return '';
                }
            }
        },
        address: {
            type: DataTypes.STRING(256)
        },
        phone: {
            type: DataTypes.STRING(11)
        },
        name: {
            type: DataTypes.STRING(16)
        },
        is_ban: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_review: {
            // 是否在审核状态: 0: 否 1:是
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        level: {
            // 用户等级: 0: 普通会员 1:付费会员
            type: DataTypes.INTEGER(1),
            defaultValue: 0
        }
    }, {
        classMethods: {
            associate: function(models) {
                User.hasMany(models.review_user);
            },
            getFailReasons: function() {
                return reasons;
            },
            getAuthenticated: function(candidate, callback) {
                this.findOne({
                    where: {
                        id_card: candidate.id_card
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
