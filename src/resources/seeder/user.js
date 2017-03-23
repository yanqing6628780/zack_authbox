module.exports = function(config) {
    var Model = require(config.path.models + '/user_schema.js');
    var modelName = 'user';

    var exports = {};

    exports.run = function() {
        Model.remove(function(err) {
            console.log(err);
        });

        //admin Add
        var adminData = {
            phone: "12345678990",
            user_type: "admin",
            nickname: "管理员",
            username: "admin",
            password: "12345678",
            email: "admin@admin.com"
        }

        Model.create(adminData)
            .then(function(mongooseDocuments) {
                console.log(modelName + ' insert success.');
                process.exit();
            })
            .catch(function(err) {
                console.log(modelName + ' insert failed.err:');
                console.log(err);
                process.exit();
            });
    }


    return exports;
}
