module.exports = function(config) {
    var Oauth = require(config.path.models + '/oauth.js');
    var modelName = 'OAuthClientsModel';
    var OAuthClientsModel = Oauth.OAuthClientsModel
    var exports = {};

    exports.run = function() {
        OAuthClientsModel.remove(function(err) {
            console.log(err);
        });

        //admin Add
        var clientData = {
            clientId: "tom",
            clientSecret: "qwert",
            redirectUri: "",
        }

        OAuthClientsModel.create(clientData)
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
