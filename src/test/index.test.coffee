supertest = require('supertest')
cheerio = require('cheerio')
should = require('should')

app = require('../app')
request = supertest(app)


describe '首页测试', () ->
    it "正常显示", (done) ->
        request.get '/'
            .expect 200, done
        return

    it "内容显示", (done) ->
        request.get '/'
            .expect(200)
            .end (err, res) ->
                if err
                    return done err
                $ = cheerio.load res.text
                $ 'h1'
                    .text()
                    .should
                    .equal('首页')
                done()
        return
