supertest = require('supertest')
cheerio = require('cheerio')
should = require('should')
app = require('../app')
request = supertest(app)
configs = require('y-config').getConfig()
User = require "#{config.path.models}user_schema.js"

describe '后台管理页测试', () ->

    admin_cookie = null
    user_cookie = null
    # 管理员用户
    adminData = {
        user_type: "admin",
        nickname: "管理员",
        username: "unitTest123",
        password: "12345678",
        email: "unitTest@unitTest.com"
    }
    # 非管理员用户
    userData = {
        user_type: "user",
        nickname: "管理员",
        username: "user123",
        password: "123456789",
        email: "user123@user123.com"
    }
    # 添加管理员调试数据
    before (done) ->
        User.create adminData
            .then (mongooseDocuments) ->
                return done()
            .catch (err) ->
                console.log err
                return done()

        return

    # 添加非管理员调试数据
    before (done) ->
        User.create userData
            .then (mongooseDocuments) ->
                return done()
            .catch (err) ->
                console.log err
                return done()

        return

    # 获取管理员登录cookie
    before (done) ->

        request.post '/login'
        .send {
            username: adminData.username,
            password: adminData.password
        }
        .end (err, res) ->
            admin_cookie = res.headers['set-cookie'].pop().split(';')[0]
            done err
        return

    # 获取非管理员登录cookie
    before (done) ->

        request.post '/login'
        .send {
            username: userData.username,
            password: userData.password
        }
        .end (err, res) ->
            user_cookie = res.headers['set-cookie'].pop().split(';')[0]
            done err
        return

    # 测试完成后删除管理员调试数据
    after (done) ->
        User.remove { username: adminData.username }, (err, res) ->
            if err
                console.log err
            return done()
        admin_cookie = null

        return

    # 测试完成后删除非管理员调试数据
    after (done) ->
        User.remove { username: userData.username }, (err, res) ->
            if err
                console.log err
            return done()
        user_cookie = null

        return

    it "未登录，拒绝访问", (done) ->
        request.get '/admin'
            .expect 302, done
        return

    it "可以访问", (done) ->
        request.get '/admin'
            .set('cookie', admin_cookie)
            .expect 200, done
        return

    it "内容显示", (done) ->
        request.get '/admin'
            .set('cookie', admin_cookie)
            .expect 200
            .end (err, res) ->
                if err
                    return done err
                $ = cheerio.load res.text
                $ 'h2'
                    .text()
                    .should
                    .equal('欢迎使用后台管理系统')
                done()
        return

    it "非管理员无法登入admin页", (done) ->
        request.get '/admin'
            .set('cookie', user_cookie)
            .expect 302
            .expect 'Location', '/login'
            .end done
        return
