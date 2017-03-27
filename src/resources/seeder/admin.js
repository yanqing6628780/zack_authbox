module.exports = function(models) {
    var Model = models.admin;

    var exports = {};

    exports.run = function() {
        Model.truncate().catch(err => console.log(err));

        //admin Add
        var adminData = {
            username: "admin",
            password: "123456"
        }

        Model.create(adminData)
            .then(function(user) {
                console.log('%s insert success.', user);
                process.exit();
            })
            .catch(function(err) {
                console.log('insert failed err: %s', err);
                process.exit();
            });
    }

    return exports;
}
