module.exports = function(models) {
    var Model = models.admin;

    var exports = {};

    exports.run = function() {
        //admin Add
        var adminData = [
            {
                username: "admin",
                password: "123456",
                adminRoleId: 1
            },
            {
                username: "user",
                password: "123456",
                adminRoleId: 2
            }
        ]

        Model.bulkCreate(adminData)
            .then(function(rs) {
                console.log('%s insert success.', rs);
                process.exit();
            })
            .catch(function(err) {
                console.log('insert failed err:');
                console.log(err);
                process.exit();
            });
    }

    return exports;
}
