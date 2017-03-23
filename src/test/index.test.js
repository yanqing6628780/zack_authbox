var supertest = require('supertest');
var cheerio = require('cheerio');
var should = require('should');

var app = require('../app');
var request = supertest(app);

describe.skip('首页测试 js 写法', function() {
    it("正常显示", function(done) {
        request.get('/').expect(200, done);
    });

    it("内容显示", function(done) {
        request.get('/')
            .expect(200)
            .end(function(err, res){
                if (err) return done(err);
                $ = cheerio.load(res.text);
                $('h1').text().should.equal('首页');
                done(err);
            });
    });
});
