module.exports = function (sequelize) {

    exports.run = function () {
        sequelize.query("CREATE UNIQUE INDEX users_id_card_unique ON users(id_card)").then(function (data) {
            console.log(data);
        }).catch(err => {
            console.log(err);
        });
        sequelize.query("CREATE UNIQUE INDEX id_card ON users(id_card)").then(function (data) {
            console.log(data);
        }).catch(err => {
            console.log(err);
        });
    };

    return exports;
};
