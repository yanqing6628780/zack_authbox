'use strict'

exec = require('child_process').exec

module.exports = (gulp, config, $, args) ->

    gulp.task 'db', ['db:seeder']

    gulp.task 'db:seeder', (callback) ->
        exec "node #{config.resource}seeder/index.js"
        , (error, stdout, stderr) ->
            console.log "stdout: #{stdout}"
            console.log "stderr: #{stderr}"
            if error != null
                console.log "exec error: #{error}"
                callback(error)
