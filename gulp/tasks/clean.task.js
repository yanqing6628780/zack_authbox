'use strict'

module.exports = function(gulp, config, $, args) {

    gulp.task('clean', function() {
        return gulp.src(config.target + 'public')
            .pipe($.clean());
    });
};
