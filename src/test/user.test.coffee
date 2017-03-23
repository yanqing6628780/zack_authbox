supertest = require('supertest')
should = require('should')

app = require('../app')
request = supertest(app)


describe '用户资料接口测试', () ->
    getUrl  = '/api/v1/user/'
    userUrl  = '/oauth/token'
    Token = ''
    postErrDataRequest = (done, userData, expectResult) ->
        request.get getUrl
        .query userData
        .expect 200
        .end (err, res) ->
            should.not.exist(err)
            should.exist(res)
            res.should.be.json
            jsonRes = JSON.parse res.text
            jsonRes.should.eql expectResult
            done err
        return

    it "password认证 获取access token", (done) ->
        userData = {
            grant_type: 'password'
            client_id: 'tom'
            client_secret: 'qwert'
        }
        userData.username = 'admin'
        userData.password = 12345678
        request.post userUrl
            .type('form')
            .send userData
            .expect 200
            .end (err, res) ->
                should.not.exist(err)
                should.exist(res)
                res.should.be.json
                jsonRes  = JSON.parse res.text
                jsonRes.should.have.property 'access_token'
                jsonRes.should.have.property 'expires_in'
                jsonRes.should.have.property 'refresh_token'
                Token = res.body.access_token
                done err
        return

    it "用户登录接口 get方法访问", (done) ->
        request.get getUrl
            .expect 400, done
        return

    it "带token 获取用户资料", (done) ->
        request.get getUrl
        .query {
            access_token: Token
        }
        .expect 200
        .end (err, res) ->
            should.not.exist(err)
            should.exist(res)
            res.should.be.json
            jsonRes = JSON.parse res.text
            jsonRes.should.have.property '__v'
            jsonRes.should.have.property '_id'
            jsonRes.should.have.property 'createdAt'
            done err
        return
