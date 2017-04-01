"use strict";

const bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
    var reasons = {
        FAIL: 0,
        MAX_ATTEMPTS: 1,
        BAN: 2
    };
    var model = sequelize.define("admin", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING(32),
            allowNull: false
        },
        password: {
            type: DataTypes.STRING(60),
            allowNull: false,
            set: function (val) {
                val = bcrypt.hashSync(val.toString().trim());
                this.setDataValue('password', val);
            }
        }
    }, {
        classMethods: {
            associate: function(models) {
                model.belongsTo(models.admin_role);
            },
            getFailReasons: function() {
                return reasons;
            },
            getAuthenticated: function(candidate, callback) {
                this.findOne({
                    where: {
                        username: candidate.username
                    },
                    include: [sequelize.models.admin_role]
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

    return model;
};
