supertest = require('supertest')
cheerio = require('cheerio')
should = require('should')
app = require('../app')
config = require('authbox-config')()
request = supertest(app)
User = require "#{config.path.models}user_schema.js"

describe '添加与编辑 测试', () ->

    cookieLogin = null
    userId = null
    saveUrl = '/admin/users/save'
    # 添加一个用于测试的管理员用户
    adminData = {
        user_type: "admin",
        nickname: "管理员",
        username: "testAadminLogin",
        password: "12345678",
        email: "test@test.com"
    }
    # 定义一个新数据
    saveData = {
        user_type: "admin",
        nickname: "管理员",
        username: "saveTest666",
        password: "12345678",
        email: "save@save.com"
    }
    # 添加管理员调试数据
    before (done) ->
        User.create adminData
            .then (mongooseDocuments) ->
                userId = String mongooseDocuments._id
                return done()
            .catch (err) ->
                console.log err
                return done()
        return

    # 获取登录时的cookie
    before (done) ->
        request.post '/login'
        .send {
            username: adminData.username,
            password: adminData.password
        }
        .end (err, res) ->
            cookieLogin = res.headers['set-cookie'].pop().split(';')[0]
            done err
        return

    # 测试完成之后删除测试数据
    after (done) ->
        User.remove { username: adminData.username }, (err, res) ->
            if err
                console.log err
            return done()
        return

    # 测试完成之后删除测试数据
    after (done) ->
        User.remove { username: saveData.username }, (err, res) ->
            if err
                console.log err
            return done()
        return

    it "未登录,跳转login页", (done) ->
        request.get saveUrl
            .expect 302
            .expect 'Location', '/login'
            .end done
        return

    it "添加一个新用户数据", (done) ->
        request.post saveUrl
            .set 'cookie', cookieLogin
            .type 'form'
            .send saveData
            .expect 302
            .end done
        return

    it "未登录 新用户添加失败", (done) ->
        request.post saveUrl
            .type 'form'
            .send saveData
            .expect 302
            .expect 'Location', '/login'
            .end done
        return

    it "失败测试 新用户名不能重复", (done) ->
        request.post saveUrl
            .set 'cookie', cookieLogin
            .type 'form'
            .send {
                user_type: "admin",
                nickname: "管理员",
                username: "testAadminLogin",
                password: "12345678",
                email: "test1@test.com"
            }
            .expect 500
            .end done
        return

    it "失败测试 添加新用户设置太短", (done) ->
        request.post saveUrl
            .set 'cookie', cookieLogin
            .type 'form'
            .send {
                user_type: "admin",
                nickname: "管理员",
                username: "testAadminLogin12",
                password: "12",
                email: "test1@test.com"
            }
            .expect 500
            .end done
        return

    it "失败测试 添加新用户密码设置太长", (done) ->
        request.post saveUrl
            .set 'cookie', cookieLogin
            .type 'form'
            .send {
                user_type: "admin",
                nickname: "管理员",
                username: "testAadminLogin12",
                password: "12dddddgdgdgf11111111111111111111111111111111111",
                email: "test@test.com"
            }
            .expect 500
            .end done
        return

    it "失败测试 添加新用户邮件地址不能重复", (done) ->
        request.post saveUrl
            .set 'cookie', cookieLogin
            .type 'form'
            .send {
                user_type: "admin",
                nickname: "管理员",
                username: "testAadminLogin12",
                password: "12345678",
                email: "test@test.com"
            }
            .expect 500
            .end done
        return

    it "编辑用户资料", (done) ->
        request.post saveUrl
            .set 'cookie', cookieLogin
            .type 'form'
            .send {
                id: userId,
                user_type: "admin",
                nickname: "管理员",
                username: "testAadminLogin",
                password: "",
                email: "unit@unitTest.com"
            }
            .expect 302
            .expect 'Location', '/admin/users'
            .end done
        return

    it "失败测试，编辑用户名重复", (done) ->
        request.post saveUrl
            .set 'cookie', cookieLogin
            .type 'form'
            .send {
                id: userId,
                user_type: "admin",
                nickname: "管理员",
                # 将测试数据中的用户名编辑成已经存在的用户名'saveTest666'
                username: "saveTest666",
                password: "",
                email: "unit12@unitTest.com"
            }
            .expect 500
            .end done
        return

    it "失败测试，编辑用户名不能为空", (done) ->
        request.post saveUrl
            .set 'cookie', cookieLogin
            .type 'form'
            .send {
                id: userId,
                user_type: "admin",
                nickname: "管理员",
                username: "",
                password: "",
                email: "unit@unitTest.com"
            }
            .expect 500
            .end done
        return

    it "失败测试，编辑 输入密码位数不够", (done) ->
        request.post saveUrl
            .set 'cookie', cookieLogin
            .type 'form'
            .send {
                id: userId,
                user_type: "admin",
                nickname: "管理员",
                username: "testAadminLogin",
                password: "123",
                email: "unit@unitTest.com"
            }
            .expect 500
            .end done
        return

    it "失败测试，编辑 输入密码位数过长", (done) ->
        request.post saveUrl
            .set 'cookie', cookieLogin
            .type 'form'
            .send {
                id: userId,
                user_type: "admin",
                nickname: "管理员",
                username: "testAadminLogin",
                password: "12345678111111111112222222222233333333333333333333",
                email: "unit@unitTest.com"
            }
            .expect 500
            .end (err, res) ->
                if err
                    console.log err
                done err
        return

    it "失败测试，编辑 输入密码不允许全是空格", (done) ->
        request.post saveUrl
            .set 'cookie', cookieLogin
            .type 'form'
            .send {
                id: userId,
                user_type: "admin",
                nickname: "管理员",
                username: "testAadminLogin",
                password: "        ",
                email: "unit@unitTest.com"
            }
            .expect 500
            .end (err, res) ->
                if err
                    console.log err
                done err
        return

    it "失败测试，编辑 邮件格式不对应该不允许通过，此处能通过", (done) ->
        request.post saveUrl
            .set 'cookie', cookieLogin
            .type 'form'
            .send {
                id: userId,
                user_type: "admin",
                nickname: "管理员",
                username: "testAadminLogin",
                password: "12345678",
                email: "123.com"
            }
            .expect 302
            .end (err, res) ->
                if err
                    console.log err
                done err
        return
