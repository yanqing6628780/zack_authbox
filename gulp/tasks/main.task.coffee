'use strict'

module.exports = (gulp, config, $, args) ->

    gulp.task 'default', ['clean'], () ->
        $.runSequence 'build'

    gulp.task 'build', [
        'js:build', 'js:copy'
        'css:build', 'css:copy'
        'image:build'
        'dist:build'
        # 'assert:build'
    ]
