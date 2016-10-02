'use strict';
const gulp        = require('gulp');
const gulpNodemon = require('gulp-nodemon');
// tests
const istanbul    = require('gulp-istanbul');
const mocha       = require('gulp-mocha');

gulp.task('pre-test', function () {
  return gulp.src(['server/**/*.js', 'client/**/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function () {
  return gulp.src(['test/tests/**/*.js'])
    .pipe(mocha())
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});

gulp.task('nodemon', function () {
  gulpNodemon({
    script: 'cli/start.js',
    env: {
      RABBIT_MQ_URI: 'amqp://192.168.99.100',
      DESTINATION_HOST_WHITELIST: 'habem.us',
    },
    ext: 'js',
    ignore: [
      'client/**/*',
      'dist/**/*',
      'gulpfile.js',
    ],
  })
});
