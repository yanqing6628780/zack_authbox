var crypto = require('crypto');

module.exports = (() => {
    var utl = {};

    utl.getIDCardAge = (ic) => {
        var myDate = new Date();
        var month = myDate.getMonth() + 1;
        var day = myDate.getDate();
        var age = myDate.getFullYear() - ic.substring(6, 10) - 1;
        if (ic.substring(10, 12) < month || ic.substring(10, 12) == month && ic.substring(12, 14) <= day) {
            age++;
        }
        return age;
    };

    /**
     * 对字符串进行签名验证
     * @param {String} str 要验证的参数字符串
     * @param {String} sign 要验证的签名
     * @param {String} publicKey 支付宝公钥
     * @param {String} [signType] 签名类型
     * @returns {Boolean}
     */
    utl.signVerify = function (str, sign, publicKey, signType) {
        var verify;
        if(signType === 'RSA2') {
            verify = crypto.createVerify('RSA-SHA256');
        } else {
            verify = crypto.createVerify('RSA-SHA1');
        }
        verify.update(str, 'utf8');
        var result = verify.verify(publicKey, sign, 'base64');
        return result;
    };

    /**
     * 对字符串进行签名
     * @param {String} str 要签名的字符串
     * @param {String} privateKey 商户应用私钥
     * @param {String} [signType] 签名类型
     * @returns {String}
     */
    utl.sign = function (str, privateKey, signType) {
        var sha;
        if(signType === 'RSA2') {
            sha = crypto.createSign('RSA-SHA256');
        } else {
            sha = crypto.createSign('RSA-SHA1');
        }
        sha.update(str, 'utf8');
        return sha.sign(privateKey, 'base64');
    };


    /**
     * 对请求参数进行组装、编码
     * @param {Object} params  请求参数
     * @returns {Object}
     */
    utl.encodeParams = function (params) {
        var keys = [];
        for(var k in params) {
            if (params[k] !== undefined && params[k] !== "") keys.push(k);
        }
        keys.sort();

        var unencodeStr = "";
        var encodeStr = "";
        var len = keys.length;
        for(var i = 0; i < len; ++i) {
            let k = keys[i];
            if(i !== 0) {
                unencodeStr += '&';
                encodeStr += '&';
            }
            unencodeStr += k + '=' + params[k];
            encodeStr += k + '=' + encodeURIComponent(params[k]);
        }
        return {unencode:unencodeStr, encode:encodeStr};
    };

    return utl;
})();
