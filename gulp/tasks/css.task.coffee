'use strict'

module.exports = (gulp, config, $, args) ->

    gulp.task 'css', ['css:build', 'css:lib:copy', 'css:copy']

    gulp.task 'css:build', ['css:build:root']

    gulp.task 'css:build:root', () ->
        gulp.src ["#{config.resource}assets/stylesheet/**/*.{css,styl}"]
            .pipe $.if '*.styl', $.stylus()
            .pipe $.autoprefixer '> 1% in CN', 'last 2 versions'
            .pipe $.concat 'style.css'
            .pipe $.if not args.dev, $.csso()
            .pipe gulp.dest "#{config.target}public/stylesheets/"

    gulp.task 'css:lib:copy', () ->
        gulp.src [
            "#{config.bowerPath}/bootstrap/dist/css/bootstrap*.css{,.map}"
            "#{config.resource}assets/stylesheet/**/*"
            "!#{config.resource}assets/stylesheet/**/*.styl"
        ]
            .pipe gulp.dest "#{config.target}public/stylesheets/lib/"

    gulp.task 'css:copy', () ->
        gulp.src [
            "#{config.resource}assets/stylesheet/**/*"
            "!#{config.resource}assets/stylesheet/**/*.styl"
        ]
            .pipe gulp.dest "#{config.target}public/stylesheets/"
