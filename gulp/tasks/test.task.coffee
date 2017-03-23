'use strict'

module.exports = (gulp, config, $, args) ->

    gulp.task 'test', ['lint'], ->

        gulp.src [
            "#{config.source}app.{js,coffee}"
            "#{config.source}test/*.test.{js,coffee}"
        ], { read: false }
            .pipe $.mocha { reporter: 'dot' }
            .once 'error', ->
                process.exit(1)
            .once 'end', ->
                process.exit()

    gulp.task 'lint', ['lint:editorstyle', 'lint:coffee']

    gulp.task 'lint:editorstyle', ->

        gulp.src [
            "#{config.source}**"
            "gulp/**"
            "*.{json,md,js}"
            "!**/*.{opts,png,jpg,bmp}"
        ]
            .pipe $.lintspaces({
                editorconfig : '.editorconfig'
                ignores: [
                    'js-comments'
                ]
            })
            .pipe $.lintspaces.reporter({
                breakOnWarning : true
            })

    gulp.task 'lint:coffee', ->

        gulp.src [
            "#{config.source}{,**/}*.coffee"
            "gulp/{,**/}*.coffee"
        ]
            .pipe $.coffeelint()
            .pipe $.coffeelint.reporter 'coffeelint-stylish'
            .pipe $.coffeelint.reporter 'fail'
