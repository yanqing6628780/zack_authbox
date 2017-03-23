'use strict'

module.exports = (gulp, config, $, args) ->

    gulp.task 'apidoc', (done) ->
        $.apidoc {
            src: "#{config.target}app/controllers/api"
            dest: "#{config.target}/public/apidoc"
            debug: true
        }, done
