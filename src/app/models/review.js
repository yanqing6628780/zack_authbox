"use strict";

module.exports = function(sequelize, DataTypes) {
    var model = sequelize.define("review_user", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        key_value: {
            /*
             *   {
             *       字段名: 值
             *       字段名: 值
             *   }
             */
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        paranoid: true,
        classMethods: {
            associate: function(models) {
                model.belongsTo(models.admin);
                model.belongsTo(models.user);
            }
        }
    });

    return model;
};
