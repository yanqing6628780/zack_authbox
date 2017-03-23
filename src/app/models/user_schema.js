'use strict';

var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    SALT_WORK_FACTOR = 10,
    ObjectId = require('mongoose').Types.ObjectId;

var passwordPatrn = /^[\w -:;"',!=\/&@{}#%_|~<>€£¥•()\[\]\+\*\?\.\^\$]{8,32}$/;
var passwordPatrnMsg = '需要输入8-32个字母、数字、下划线和部分特殊字符(如:!&@{}#%)';

var usernamePatrn = /^[a-z0-9][\w@.]{2,31}$/;
var usernamePatrnMsg = '需要输入3-32个以字母或数字开头、可带数字、“_”、“@”、“.”的字串';

var phonePatrn = /^((\d{11})|((\d{7,8})|(\d{3,4})-(\d{7,8})|(\d{3,4})-(\d{7,8})-(\d{1,4})|(\d{7,8})-(\d{1,4}))$)/;
var phonePatrnMsg = '支持11位手机号码;3-4位区号,7-8位直拨号码,1－4位分机号';

const oAuthTypes = [
    'github',
    'qq',
    'wechat',
    'weibo',
];

// Schema 结构
var Schema = mongoose.Schema;
var userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        trim: true,
        default: '',
    },
    email: {
        type: String,
        required: true,
        trim: true,
        default: '',
    },
    nickname: {
        type: String,
        trim: true,
        default: '',
    },
    phone: {
        type: String,
        trim: true,
        default: '',
    },
    user_type: {
        type: String,
        enum: ['admin', 'user'],
        default: 'admin'
    },
    usergroup: {
        type: Array,
        default: []
    },
    provider: {
        type: String,
        default: ''
    },
    isban: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});


userSchema.path('username').validate(function(username, respond) {
    const User = mongoose.model('users', userSchema);
    const id = new ObjectId(this._id);

    var query = User.find({ username: username }).where('_id').ne(id);

    query.exec().then(
        function(result) {
            if (result.length === 0) {
                if (!usernamePatrn.exec(username)) {
                    return respond(false, '{PATH} ' + usernamePatrnMsg);
                }
                return respond(true);
            } else {
                return respond(false);
            }
        },
        function() {
            return respond(false);
        }
    );

}, '{PATH} <{VALUE}> already exists');

userSchema.path('email').validate(function(email, respond) {
    const User = mongoose.model('users', userSchema);
    const id = new ObjectId(this._id);

    var query = User.find({ email: email }).where('_id').ne(id);

    query.exec().then(
        function(result) {
            return respond(!result.length);
        },
        function() {
            return respond(false);
        }
    );

}, '{PATH} <{VALUE}> already exists');

userSchema.path('password').validate(function(password, respond) {
    if (this.isNew && this.provider === '') {
        if (!passwordPatrn.exec(password)) {
            return respond(false, '{PATH} ' + passwordPatrnMsg);
        }
        return respond(true);
    }

    if (this.isModified('password') && !passwordPatrn.exec(password)) {
        return respond(false, '{PATH} ' + passwordPatrnMsg);
    }

    return respond(true);
}, '{PATH} is required');

userSchema.path('phone').validate(function(value, respond) {
    if (value.length > 0 && !phonePatrn.exec(value)) {
        return respond(false, '{PATH} ' + phonePatrnMsg);
    }

    return respond(true);
}, '{PATH} is required');

userSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        var hash = bcrypt.hashSync(user.password, salt);
        user.password = hash;
        next();
    });
});

var reasons = userSchema.statics.failedLogin = {
    FAIL: 0,
    MAX_ATTEMPTS: 1,
    BAN: 2
};

userSchema.method = {
    skipValidation: function() {
        return ~oAuthTypes.indexOf(this.provider);
    }
}

userSchema.statics.getAuthenticated = function(candidate, callback) {
    this.findOne({ username: candidate.username }).exec().then(
        function(user) {
            if (!user) {
                return callback(null, null, reasons.FAIL);
            }

            bcrypt.compare(candidate.password, user.password, function(err, isMatch) {
                if (err) {
                    return callback(err, null, reasons.FAIL);
                }
                if (isMatch) {
                    if(user.isban) {
                        return callback(null, null, reasons.BAN);
                    } else {
                        return callback(null, user);
                    }
                } else {
                    return callback(null, null, reasons.FAIL);
                }
            });
        },
        function(err) {
            return callback(err, null, reasons.FAIL);
        }
    );

};

module.exports = mongoose.model('users', userSchema);
