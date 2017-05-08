'use strict'

supervisor = require "gulp-supervisor"
browserSync = require 'browser-sync'

module.exports = (gulp, config, $, args) ->

    gulp.task 'server', ->

        if not args.dev
            console.log "Please use development mode, e.g. `gulp server -d`."
            return

        $.runSequence 'default', 'server:start', ['apidoc', 'server:watch']

    gulp.task 'server:start', () ->
        supervisor "#{config.source}bin/www",
            {
                args: ['development']
                watch: [
                    "#{config.source}/src/app.js",
                    "#{config.source}/app",
                    "#{config.source}/config",
                    "#{config.source}/bin",
                    "#{config.source}/node_modules"
                ]
                ignore: [ "#{config.source}/app/views" ]
                pollInterval: 3000
                extensions: [ "js","yaml" ]
                debug: true
                debugBrk: false
                harmony: true
                noRestartOn: false
                forceWatch: true
                quiet: false
            }

    gulp.task 'server:watch', () ->
        gulp.watch [
            "#{config.source}app/controllers/api/*.js"
        ], (event) ->
            console.log "File #{event.path} was #{event.type}"
            $.runSequence 'apidoc'

        gulp.watch [
            "#{config.source}resources/assets/**/*.{js,coffee,pug}"
        ], (event) ->
            console.log "File #{event.path} was #{event.type}"
            $.runSequence 'asset:build'

        gulp.watch [
            "#{config.source}resources/assets/**/*.{css,styl}"
        ], (event) ->
            console.log "File #{event.path} was #{event.type}"
            $.runSequence 'css:build'

        gulp.watch [
            "#{config.source}resources/assets/**/*.{jpg,png,bmp,jpeg}"
        ], (event) ->
            console.log "File #{event.path} was #{event.type}"
            $.runSequence 'image:build'
