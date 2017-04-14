'use strict';
const gulp = require('gulp');
const filters = require('gulp-filter');
const insert = require('gulp-insert');
const sass = require('gulp-sass');
const merge = require('merge-stream');
const vulcanize = require('gulp-vulcanize');
const $ = require('gulp-load-plugins')();
const runSequence = require('run-sequence');

const filter = filters(['*', '!app/css/skins/color-vars-template.scss', '!app/css/skins/skin-template.scss']);

gulp.task('sass', () => {
  gulp.src('./app/**/*.scss')
    .pipe(filter)
    .pipe(sass().on('error', sass.logError))
});

gulp.task('sass:watch', () => {
  gulp.watch('./app/**/*.scss', ['sass'])
    .pipe(filter);
});

gulp.task('insert', () => {
  gulp.src(['app/css/skins/default/color-vars-body.css',
      'app/css/skins/default/color-vars.css'])
    .pipe(insert.append('</style>'))
    .pipe(insert.prepend("<style is=\"custom-style\">"));
});

gulp.task('copy', () => {
  const bower = gulp.src([
    'bower_components/**/*'
  ]).pipe(gulp.dest('app/bower_components'));

  const vulcanized = gulp.src(['app/components/dashboard/dashboard.html'])
    .pipe($.rename('dashboard.vulcanized.html'))
    .pipe(gulp.dest('app/components/dashboard'));

  return merge(bower);
});

gulp.task('vulcanize', () => {
  return gulp.src('../app/components/dashboard/dashboard.vulcanized.html')
    .pipe(vulcanize({
      abspath: '',
      excludes: ['../bower_components/polymer/polymer.html',
        '../app/bower_components/polymer/polymer.html'
      ],
      stripExcludes: false
    }))
    .pipe(gulp.dest('../app/components/dashboard'));
});

gulp.task('precache', (callback) => {
});

gulp.task('default', (cb) =>  {
  runSequence(
    ['sass','insert', 'copy'],
    'vulcanize', 'precache',
    cb)
});

require('web-component-tester').gulp.init(gulp);