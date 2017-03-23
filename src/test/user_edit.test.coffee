supertest = require('supertest')
cheerio = require('cheerio')
should = require('should')
app = require('../app')
config = require('authbox-config')()
request = supertest(app)
User = require "#{config.path.models}user_schema.js"

describe '用户编辑页测试', () ->

    cookieLogin = null
    userId = null
    url = null
    # 添加测试数据
    adminData = {
        user_type: "admin",
        nickname: "管理员",
        username: "unitTest123",
        password: "12345678",
        email: "unitTest@unitTest.com"
    }

    before (done) ->
        User.create adminData
            .then (mongooseDocuments) ->
                userId = String mongooseDocuments._id
                url = "/admin/users/edit/#{userId}"
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
        cookieLogin = null
        return

    it "未登录，不能访问", (done) ->
        request.get url
            .expect 302
            .expect 'Location', '/login'
            .end done
        return

    it "能正常访问", (done) ->
        request.get url
            .set('cookie', cookieLogin)
            .expect 200, done
        return

    it "内容显示", (done) ->
        request.get url
            .set('cookie', cookieLogin)
            .expect 200
            .end (err, res) ->
                if err
                    return done err
                $ = cheerio.load res.text
                $ 'label.control-label'
                    .text()
                    .should
                    .containEql('用户名')
                done()
        return

    it "输入框的用户名应该和数据库的用户名一致", (done) ->
        request.get url
            .set('cookie', cookieLogin)
            .expect 200
            .end (err, res) ->
                if err
                    return done err
                $ = cheerio.load res.text
                $ 'input.form-control'
                    .val()
                    .should
                    .containEql(adminData.username)
                done()
        return
