'use strict'

module.exports = (gulp, config, $, args) ->

    gulp.task 'js', ['js:build', 'js:copy']

    gulp.task 'js:build', ['js:build:root']

    gulp.task 'js:build:root', () ->
        gulp.src [
            "#{config.resource}asserts/javascripts/*.{js,coffee}"
        ]
            .pipe $.if '*.coffee', $.coffee()
            .pipe $.concat 'script.js'
            .pipe $.if not args.dev, $.uglify()
            .pipe gulp.dest "#{config.target}public/javascript/"

    gulp.task 'js:copy', ['js:bower:copy', 'js:lib:copy']

    gulp.task 'js:bower:copy', () ->
        gulp.src [
            "#{config.bowerPath}bootstrap/dist/js/bootstrap.min.js{,.map}"
            "#{config.bowerPath}jquery/dist/jquery.min.js{,.map}"
        ]
            .pipe gulp.dest "#{config.target}public/javascripts/lib/"

    gulp.task 'js:lib:copy', () ->
        gulp.src [
            "#{config.resource}assets/javascripts/lib/*"
        ]
            .pipe gulp.dest "#{config.target}public/javascripts/"
