'use strict'

browserSync = require 'browser-sync'

module.exports = (gulp, config, $, args) ->

    gulp.task 'default', ['clean'], () ->
        $.runSequence 'build', 'live'

    gulp.task 'build', [
        'js:build', 'js:copy'
        'css:build', 'css:copy'
        'image:build'
        'dist:build'
        # 'assert:build'
    ]

    gulp.task 'live', (done) ->
        browserSync {
            ui: 
                port: 8001
            port        : 8002
            open        : false
            notify      : true
            reloadDelay : 500
            server      : "#{config.source}../_site"
        }
        done()
