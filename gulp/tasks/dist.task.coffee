'use strict'

module.exports = (gulp, config, $, args) ->

    gulp.task 'dist', ['dist:build']

    gulp.task 'dist:build', () ->
        return if args.dev

        gulp.src [
            "#{config.source}app/**"
            "#{config.source}config/**"
            "#{config.source}bin/**"
            "#{config.source}utils/**"
            "#{config.source}pem/**"
            "#{config.source}*.json"
            "#{config.source}*.js"
        ], { base: 'src' }
            .pipe gulp.dest config.target
