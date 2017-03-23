supertest = require('supertest')
cheerio = require('cheerio')
should = require('should')
app = require('../app')
config = require('authbox-config')()
request = supertest(app)
User = require "#{config.path.models}user_schema.js"

describe '删除数据测试', () ->

    admin_cookie = null
    userId = null
    url = null

    # 添加一个用于测试的管理员用户
    adminData = {
        user_type: "admin",
        nickname: "管理员",
        username: "testAadminLogin",
        password: "12345678",
        email: "test@test.com"
    }
    # 添加一个测试数据
    deleteData = {
        user_type: "admin",
        nickname: "管理员",
        username: "deleteData",
        password: "12345678",
        email: "delete@delete.com"
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

    # 添加一个为测'删除'功能的用户数据并获取到ID
    before (done) ->
        User.create deleteData
            .then (mongooseDocuments) ->
                userId = String mongooseDocuments._id
                url = "/admin/users/delete/#{userId}"
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

    it "正常显示", (done) ->
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
                $ 'a.btn.btn-danger'
                    .text()
                    .should
                    .containEql('删')
                done()
        return

    it "失败测试 未登录删除失败", (done) ->
        request.get url
            .expect 302
            .expect 'Location', '/login'
            .end done
        return

    it "失败测试 id错误 删除失败", (done) ->
        request.get '/admin/users/delete/12345'
            .set 'cookie', admin_cookie
            .expect 302
            .expect 'Location', '/admin/users'
            .end done
        return

    it "删除用户数据", (done) ->
        request.get url
            .set 'cookie', admin_cookie
            .expect 302
            .expect 'Location', '/admin/users'
            .end done
        return
