/**
 * Copyright 2013-present NightWorld.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var log = require('../utils/log.js');

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    model = module.exports;

//
// Schemas definitions
//
var OAuthAccessTokensSchema = new Schema({
    accessToken: { type: String },
    clientId: { type: String },
    userId: { type: String },
    expires: { type: Date }
});

var OAuthRefreshTokensSchema = new Schema({
    refreshToken: { type: String },
    clientId: { type: String },
    userId: { type: String },
    expires: { type: Date }
});

var OAuthClientsSchema = new Schema({
    clientId: { type: String },
    clientSecret: { type: String },
    redirectUri: { type: String }
});

var OAuthUsersSchema = new Schema({
    username: { type: String },
    password: { type: String },
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String, default: '' }
});

mongoose.model('OAuthAccessTokens', OAuthAccessTokensSchema);
mongoose.model('OAuthRefreshTokens', OAuthRefreshTokensSchema);
mongoose.model('OAuthClients', OAuthClientsSchema);
mongoose.model('OAuthUsers', OAuthUsersSchema);

var OAuthAccessTokensModel = mongoose.model('OAuthAccessTokens'),
    OAuthRefreshTokensModel = mongoose.model('OAuthRefreshTokens'),
    OAuthClientsModel = mongoose.model('OAuthClients'),
    OAuthUsersModel = mongoose.model('OAuthUsers');

model.OAuthClientsModel = OAuthClientsModel;

//使用原有用户数据库数据做getUser的认证
var UserModel = require('./user_schema');

//
// oauth2-server callbacks
//
model.getAccessToken = function(bearerToken, callback) {
    console.log('in getAccessToken (bearerToken: ' + bearerToken + ')');

    OAuthAccessTokensModel.findOne({ accessToken: bearerToken })
        .exec()
        .then(function(result) {
            if (!result) return callback(true, null);
            callback(null, {
                accessToken: result.accessToken,
                clientId: result.clientId,
                expires: result.expires,
                userId: result.userId
            });
        })
        .catch(function(err) {
            log.modelsLogger.error('oauth in getAccessToken:');
            log.modelsLogger.error(err);
            return callback(err);
        });
};

model.getClient = function(clientId, clientSecret, callback) {
    console.log('in getClient (clientId: ' + clientId + ', clientSecret: ' + clientSecret + ')');
    if (clientSecret === null) {
        return callback();
    }
    OAuthClientsModel.findOne({ clientId: clientId, clientSecret: clientSecret })
        .exec()
        .then(function(client) {
            if (!client) return callback(new Error('not find client'));
            return callback(null, {
                clientId: client.clientId,
                clientSecret: client.clientSecret
            });
        })
        .catch(function(err) {
            return callback(err);
        });
};

// This will very much depend on your setup, I wouldn't advise doing anything exactly like this but
// it gives an example of how to use the method to resrict certain grant types
var authorizedClientIds = ['s6BhdRkqt3', 'toto', 'tom'];
model.grantTypeAllowed = function(clientId, grantType, callback) {
    console.log('in grantTypeAllowed (clientId: ' + clientId + ', grantType: ' + grantType + ')');

    // if (grantType === 'password') {
    //     return callback(false, authorizedClientIds.indexOf(clientId) >= 0);
    // }

    callback(false, true);
};

model.saveAccessToken = function(token, clientId, expires, userId, callback) {
    console.log('in saveAccessToken (token: ' + token + ', clientId: ' + clientId + ', userId: ' + userId + ', expires: ' + expires + ')');

    if (typeof(userId.id) === 'string') {
        userId = userId.id;
    }

    var accessToken = new OAuthAccessTokensModel({
        accessToken: token,
        clientId: clientId,
        userId: userId,
        expires: expires
    });

    accessToken.save(callback);
};

/*
 * Required to support password grant type
 */
model.getUser = function(username, password, callback) {
    console.log('in getUser (username: ' + username + ', password: ' + password + ')');

    UserModel.getAuthenticated({ username: username, password: password }, function(err, user, reason) {
        if (err) {
            log.modelsLogger.error('oauth in getUser:');
            log.modelsLogger.error(err);
            return callback(err);
        }
        switch (reason) {
            case 0:
                return callback(null);
        }
        return callback(null, user._id);
    });
};

/*
 * Required to support refreshToken grant type
 */
model.saveRefreshToken = function(token, clientId, expires, userId, callback) {
    console.log('in saveRefreshToken (token: ' + token + ', clientId: ' + clientId + ', userId: ' + userId + ', expires: ' + expires + ')');

    if (typeof(userId.id) === 'string') {
        userId = userId.id;
    }

    var refreshToken = new OAuthRefreshTokensModel({
        refreshToken: token,
        clientId: clientId,
        userId: userId,
        expires: expires
    });

    refreshToken.save(function(err) {
        return callback(err);
    });
};

model.getRefreshToken = function(refreshToken, callback) {
    console.log('in getRefreshToken (refreshToken: ' + refreshToken + ')');

    OAuthRefreshTokensModel.findOne({ refreshToken: refreshToken })
        .exec()
        .then(function(result) {
            return callback(false, result ? result : false);
        })
        .catch(function(err) {
            return callback(err);
        });
};
