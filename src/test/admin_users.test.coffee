supertest = require('supertest')
cheerio = require('cheerio')
should = require('should')
app = require('../app')
request = supertest(app)
configs = require('y-config').getConfig()
User = require "#{config.path.models}user_schema.js"

describe '用户列表页测试', () ->

    admin_cookie = null

    # 添加一个用于测试的管理员用户
    adminData = {
        user_type: "admin",
        nickname: "管理员",
        username: "testAadminLogin",
        password: "12345678",
        email: "test@test.com"
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

    # 测试完成后删除管理员调试数据
    after (done) ->
        User.remove { username: adminData.username }, (err, res) ->
            if err
                console.log err
            return done()
        admin_cookie = null
        return

    it "未登录,跳转login页", (done) ->
        request.get '/admin/users'
            .expect 302
            .expect 'Location', '/login'
            .end done
        return

    it "带cookie,正常显示", (done) ->
        request.get '/admin/users'
        .set('cookie', admin_cookie)
            .expect 200, done
        return

    it "内容显示", (done) ->
        request.get '/admin/users'
            .set('cookie', admin_cookie)
            .expect 200
            .end (err, res) ->
                if err
                    return done err
                $ = cheerio.load res.text
                $ 'a.btn.btn-success'
                    .text()
                    .should
                    .containEql('用户名')
                done()
        return
