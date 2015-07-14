'use strict';

let babel = require('gulp-babel');
let es = require('event-stream');
let glob = require('glob');
let gulp = require('gulp');

gulp.task('default', ['src', 'test']);

gulp.task('src', () =>
    gulp.src('src/mixwith.js')
        .pipe(babel())
        .pipe(gulp.dest('.'))
        .pipe(gulp.dest('build')));

gulp.task('test', () =>
    es.merge(
        gulp.src('test/*.js').pipe(babel()),
        gulp.src(['test/mocha.opts']))
    .pipe(gulp.dest('build/test')));
