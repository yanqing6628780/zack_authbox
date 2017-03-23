supertest = require('supertest')
should = require('should')

app = require('../app')
request = supertest(app)

describe '/users/:id测试', () ->
    postUrl  = '/api/v1/users/58229796c24b6eda9a321bc3'
    userUrl  = '/oauth/token'
    getToken = ''

    it "获取access token", (done) ->
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
                jsonRes = JSON.parse res.text
                jsonRes.should.have.property 'access_token'
                jsonRes.should.have.property 'expires_in'
                jsonRes.should.have.property 'refresh_token'
                getToken = res.body.access_token
                done err
            return

    it "失败测试 不带token", (done) ->
        request.post postUrl
            .type 'form'
            .send { }
            .expect 400
            .end (err, res) ->
                should.not.exist(err)
                should.exist(res)
                res.should.be.json
                jsonRes = JSON.parse res.text
                jsonRes.should.eql {
                    code: 400
                    error: "invalid_request"
                    error_description: "The access token was not found"
                }
                done err
        return

    it "失败测试 带token但id错误", (done) ->
        request.post '/api/v1/users/5'
            .type 'form'
            .send {
                access_token: getToken
            }
            .expect 200
            .end (err, res) ->
                should.not.exist(err)
                should.exist(res)
                res.should.be.json
                jsonRes = JSON.parse res.text
                jsonRes.should.eql {
                    type: 'error',
                    msg: '请提交数据'
                }
                done err
        return

    it "失败测试 usergroup为字符串，错误提示应该为数据类型不匹配", (done) ->
        request.post postUrl
            .type 'form'
            .send {
                access_token: getToken
                'usergroup':'ddd'
            }
            .expect 200
            .end (err, res) ->
                should.not.exist err
                should.exist res
                res.should.be.json
                jsonRes = JSON.parse res.text
                jsonRes.should.eql {
                    type: 'error',
                    msg: '数据类型不匹配'
                }
                done err
        return

    it "失败测试 usergroup空", (done) ->
        request.post postUrl
            .type 'form'
            .send {
                access_token: getToken
                'usergroup[]':''
            }
            .expect 200
            .end (err, res) ->
                should.not.exist err
                should.exist res
                res.should.be.json
                jsonRes = JSON.parse res.text
                jsonRes.should.eql {
                    type: 'error',
                    msg: '请提交数据'
                }
                done err
        return
