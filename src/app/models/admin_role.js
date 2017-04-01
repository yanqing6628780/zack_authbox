"use strict";

module.exports = function(sequelize, DataTypes) {
    var model = sequelize.define("admin_role", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(32),
            allowNull: false
        },
        display_name: {
            type: DataTypes.STRING(64),
            allowNull: false,
        },
        add_user: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        special_edit_user: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        edit_user: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        del_user: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        review_user: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        reset_user_password: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        reset_admin_password: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        classMethods: {
            associate: function(models) {
                model.hasMany(models.admin);
            }
        }
    });

    return model;
};
