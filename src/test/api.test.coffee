supertest = require('supertest')
should = require('should')

app = require('../app')
request = supertest(app)


describe '接口测试', () ->
    prefix = '/api/v1/'
    loginUrl = "#{prefix}auth/login"

    postErrDataReq = (done, sendData, expectResult) ->
        request.post loginUrl
            .type 'form'
            .send sendData
            .expect 200
            .end (err, res) ->
                should.not.exist(err)
                should.exist(res)
                res.should.be.json
                jsonRes = JSON.parse res.text
                jsonRes.should.eql expectResult
                done err
        return

    it "用户登录接口 用户名为空", (done) ->
        postErrDataReq done, { username: '', password: '3231231' }, {
            type: 'error'
            msg: '请填写用户名和密码'
        }

    it "用户登录接口 密码为空", (done) ->
        postErrDataReq done, { username: 'abc64587', password: '' }, {
            type: 'error'
            msg: '请填写用户名和密码'
        }

    it "用户登录接口 不提交密码", (done) ->
        postErrDataReq done, { username: 'admin' }, {
            type: 'error'
            msg: '请填写用户名和密码'
        }

    it "用户登录接口 不提交用户名", (done) ->
        postErrDataReq done, { password: 'admin' }, {
            type: 'error'
            msg: '请填写用户名和密码'
        }

    it "用户登录接口 不提交用户名和密码", (done) ->
        postErrDataReq done, { }, {
            type: 'error'
            msg: '请填写用户名和密码'
        }

    it "用户登录接口 用户名和密码错误", (done) ->
        postErrDataReq done, { username: 'abc64587', password: '3231231' }, {
            type: 'error'
            msg: '用户名或密码错误'
        }

    it "用户登录接口 用户名错误", (done) ->
        postErrDataReq done, { username: 'abc64587', password: '123456' }, {
            type: 'error'
            msg: '用户名或密码错误'
        }

    it "用户登录接口 密码错误", (done) ->
        postErrDataReq done, { username: 'admin', password: '0123456' }, {
            type: 'error'
            msg: '用户名或密码错误'
        }

    it "用户登录接口 sql注入测试", (done) ->
        postErrDataReq done, {
            username: "admin' or 1='1' "
            password: "admin' or 1='1'"
        }, {
            type: 'error'
            msg: '用户名或密码错误'
        }

    it "用户登录接口 get方法访问", (done) ->
        request.get loginUrl
            .expect 404, done
        return

    it "用户登录接口 成功", (done) ->
        request.post loginUrl
            .type 'form'
            .send {
                username: 'admin'
                password: '123456'
            }
            .expect 200
            .end (err, res) ->
                should.not.exist(err)
                should.exist(res)
                res.should.be.json
                jsonRes = JSON.parse res.text
                jsonRes.should.have.property '_id'
                jsonRes.should.have.property 'email'
                jsonRes.should.have.property 'username', 'admin'
                done err
        return
