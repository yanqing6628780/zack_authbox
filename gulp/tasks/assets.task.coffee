'use strict'

module.exports = (gulp, config, $, args) ->

    gulp.task 'asset', ['asset:build']

    gulp.task 'asset:build', () ->

        process = gulp.src [
            "#{config.resource}assets/**"
            "!#{config.resource}assets/{images,javascripts,stylesheet}"
        ]
        return if args.DEBUG
            process.pipe gulp.dest "#{config.source}public/"
        else
            process.pipe gulp.dest "#{config.target}public/"

    gulp.task 'image', ['image:build']

    gulp.task 'image:build', () ->

        gulp.src [
            "#{config.resource}assets/images/*"
            "!#{config.resource}assets/images/favicon.ico"]
            .pipe $.cached 'image'
            .pipe $.imagemin {
                optimizationLevel : 3
                progressive       : true
                interlaced        : true
            }
            .pipe $.remember 'image'
            .pipe gulp.dest "#{config.target}assets/images/"

        gulp.src ["#{config.resource}assets/images/favicon.ico"]
            .pipe gulp.dest "#{config.target}"
