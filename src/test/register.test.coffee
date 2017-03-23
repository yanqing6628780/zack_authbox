supertest = require('supertest')
should = require('should')

app = require('../app')
request = supertest(app)


describe '注册页', () ->
    url = "/register"
    regData = {
        username: 'admin'
        email: 'admin'
        password: '123456'
        confirm_password: '123456'
        nickname: '123456'
        phone: '1234567890'
    }

    it "注册页 用户名重复", (done) ->
        request.post url
            .type 'form'
            .send regData
            .expect 302
            .expect 'Location', '/'
            .end done
        return
