'use strict'

module.exports = (gulp, config, $, args) ->

    gulp.task 'assert', ['assert:build']

    gulp.task 'assert:build', () ->

        gulp.src [
            "#{config.resource}asserts/*"
            "!#{config.resource}asserts/{images,javascript,stylesheet}"]
            .pipe gulp.dest "#{config.target}asserts/"

    gulp.task 'image', ['image:build']

    gulp.task 'image:build', () ->

        gulp.src [
            "#{config.resource}asserts/images/*"
            "!#{config.resource}asserts/images/favicon.ico"]
            .pipe $.cached 'image'
            .pipe $.imagemin {
                optimizationLevel : 3
                progressive       : true
                interlaced        : true
            }
            .pipe $.remember 'image'
            .pipe gulp.dest "#{config.target}asserts/images/"

        gulp.src ["#{config.resource}asserts/images/favicon.ico"]
            .pipe gulp.dest "#{config.target}"
