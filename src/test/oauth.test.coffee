supertest = require('supertest')
should = require('should')

app = require('../app')
request = supertest(app)


describe 'Oauth测试', () ->
    # 这里是oauth的OAuthClientsSchema表的数据
    # 如果没有请到数据库添加
    postUrl = '/oauth/token'
    postErrDataRequest = (done, oauthData, expectResult) ->
        request.post postUrl
        .type 'form'
        .send oauthData
        .expect 400
        .end (err, res) ->
            should.not.exist(err)
            should.exist(res)
            res.should.be.json
            jsonRes = JSON.parse res.text
            jsonRes.should.eql expectResult
            done err
        return
    it "password认证 获取access token", (done) ->
        # 这里的username和password是users表的数据
        # 如果没有请到数据库添加
        oauthData = {
            grant_type: 'password'
            client_id: 'tom'
            client_secret: 'qwert'
        }
        oauthData.username = 'admin'
        oauthData.password = 12345678
        request.post '/oauth/token'
            .type('form')
            .send oauthData
            .expect 200
            .end (err, res) ->
                should.not.exist(err)
                should.exist(res)
                res.should.be.json
                jsonRes = JSON.parse res.text
                jsonRes.should.have.property 'access_token'
                jsonRes.should.have.property 'expires_in'
                jsonRes.should.have.property 'refresh_token'
                done err
        return
    it "失败测试 grant_type为空", (done) ->
        postErrDataRequest done, {
            username: 'admin',
            password: '12345678',
            grant_type: '',
            client_id: 'tom',
            client_secret: 'qwert'
        },
        {
            code: 400,
            error: 'invalid_request',
            error_description: 'Invalid or missing grant_type parameter'
        }

    it "失败测试 client_id为空", (done) ->
        postErrDataRequest done, {
            username: 'admin',
            password: '12345678',
            grant_type: 'password',
            client_id: '',
            client_secret: 'qwert'
        },
        {
            code: 400,
            error: 'invalid_client',
            error_description: 'Invalid or missing client_id parameter'
        }

    it "失败测试 client_secret为空", (done) ->
        postErrDataRequest done, {
            username: 'admin',
            password: '12345678',
            grant_type: 'password',
            client_id: 'tom',
            client_secret: ''
        },
        {
            code: 400,
            error: 'invalid_client',
            error_description: 'Missing client_secret parameter'
        }

    it "失败测试 grant_type和client_id为空", (done) ->
        postErrDataRequest done, {
            username: 'admin',
            password: '12345678',
            grant_type: '',
            client_id: '',
            client_secret: 'qwert'
        },
        {
            code: 400,
            error: 'invalid_request',
            error_description: 'Invalid or missing grant_type parameter'
        }

    it "失败测试 grant_type和client_secret为空", (done) ->
        postErrDataRequest done, {
            username: 'admin',
            password: '12345678',
            grant_type: '',
            client_id: 'tom',
            client_secret: ''
        },
        {
            code: 400,
            error: 'invalid_request',
            error_description: 'Invalid or missing grant_type parameter'
        }

    it "失败测试 client_id和client_secret为空", (done) ->
        postErrDataRequest done, {
            username: 'admin',
            password: '12345678',
            grant_type: 'password',
            client_id: '',
            client_secret: ''
        },
        {
            code: 400,
            error: 'invalid_client',
            error_description: 'Invalid or missing client_id parameter'
        }

    it "失败测试 grant_type,client_id,client_secret为空", (done) ->
        postErrDataRequest done, {
            username: 'admin',
            password: '12345678',
            grant_type: '',
            client_id: '',
            client_secret: ''
        },
        {
            code: 400,
            error: 'invalid_request',
            error_description: 'Invalid or missing grant_type parameter'
        }

    it "失败测试 username,password为空", (done) ->
        postErrDataRequest done, {
            username: '',
            password: '',
            grant_type: 'password',
            client_id: 'tom',
            client_secret: 'qwert'
        },
        {
            code: 400,
            error: 'invalid_client',
            error_description: 'Missing parameters.
            \"username\" and \"password\" are required'
        }

    it "失败测试 不带username和password", (done) ->
        postErrDataRequest done, {
            grant_type: 'password',
            client_id: 'tom',
            client_secret: 'qwert'
        },
        {
            code: 400,
            error: 'invalid_client',
            error_description: 'Missing parameters.
            \"username\" and \"password\" are required'
        }

    it "失败测试 只带username不带password", (done) ->
        postErrDataRequest done, {
            username: 'admin',
            grant_type: 'password',
            client_id: 'tom',
            client_secret: 'qwert'
        },
        {
            code: 400,
            error: 'invalid_client',
            error_description: 'Missing parameters.
            \"username\" and \"password\" are required'
        }

    it "失败测试 不带username只带password", (done) ->
        postErrDataRequest done, {
            password: '12345678',
            grant_type: 'password',
            client_id: 'tom',
            client_secret: 'qwert'
        },
        {
            code: 400,
            error: 'invalid_client',
            error_description: 'Missing parameters.
            \"username\" and \"password\" are required'
        }

    it "失败测试 username大写锁定", (done) ->
        postErrDataRequest done, {
            username: 'ADMIN',
            password: '12345678',
            grant_type: 'password',
            client_id: 'tom',
            client_secret: 'qwert'
        },
        {
            code: 400,
            error: 'invalid_grant',
            error_description: 'User credentials are invalid'
        }

    it "失败测试 username输入错误", (done) ->
        postErrDataRequest done, {
            username: 'adimn',
            password: '12345678',
            grant_type: 'password',
            client_id: 'tom',
            client_secret: 'qwert'
        },
        {
            code: 400,
            error: 'invalid_grant',
            error_description: 'User credentials are invalid'
        }

    it "失败测试 password有特殊字符", (done) ->
        postErrDataRequest done, {
            username: 'admin',
            password: '1234 5678',
            grant_type: 'password',
            client_id: 'tom',
            client_secret: 'qwert'
        },
        {
            code: 400,
            error: 'invalid_grant',
            error_description: 'User credentials are invalid'
        }

    it "失败测试 password输入过长", (done) ->
        postErrDataRequest done, {
            username: 'admin',
            password: '1234567812345678789907654332',
            grant_type: 'password',
            client_id: 'tom',
            client_secret: 'qwert'
        },
        {
            code: 400,
            error: 'invalid_grant',
            error_description: 'User credentials are invalid'
        }

    it "失败测试 username,password输入错误", (done) ->
        postErrDataRequest done, {
            username: 'admin.',
            password: '12345678ddd',
            grant_type: 'password',
            client_id: 'tom',
            client_secret: 'qwert'
        },
        {
            code: 400,
            error: 'invalid_grant',
            error_description: 'User credentials are invalid'
        }
