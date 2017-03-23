'use strict';

module.exports = function () {
    var gulp = require('gulp');
    var $ = require('gulp-load-plugins')({lazy: true});
    var args = require('yargs')
        .boolean('dev').alias('d', 'dev')
        .argv;

    var config = require('./gulp.config.js')();
    if (args.dev) {
        config.target = config.targetPaths[0];
    } else {
        config.target = config.targetPaths[1];
    }


    var taskList = require('fs').readdirSync('./gulp/tasks/');
    taskList.forEach(function (file) {
        require('./tasks/' + file)(gulp, config, $, args);
    });

    gulp.task('help', $.taskListing);

};
