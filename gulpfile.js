'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    batch = require('gulp-batch'),
    ts = require('gulp-typescript'),
    inlineNg2Template = require('gulp-inline-ng2-template'),
    inlineNg2Styles = require('gulp-inline-ng2-styles'),
    sourcemaps = require('gulp-sourcemaps'),
    less = require('gulp-less'),
    lessAutoprefix = require('less-plugin-autoprefix'),
    autoprefix = new lessAutoprefix({ browsers: ['last 2 versions'] }),
    del = require('del');

gulp.task('less', function() {
  return gulp.src('app/**/*.less')
    .pipe(less({ compress: true, plugins: [autoprefix] }))
    .pipe(gulp.dest('app'));
});

gulp.task('inline-templates', ['less'], function() {
  return gulp.src('app/**/*.ts')
    .pipe(inlineNg2Template({
      base: '/app',
      useRelativePaths: true,
      removeLineBreaks: true }))
    .pipe(gulp.dest('.temp'));
});

gulp.task('tsc', ['inline-templates'], function() {
  return gulp.src(['typings/browser.d.ts', '.temp/*.ts'])
    .pipe(sourcemaps.init())
    .pipe(ts({
      target: "es5",
      module: "system",
      moduleResolution: "node",
      emitDecoratorMetadata: true,
      experimentalDecorators: true,
      removeComments: false,
      noImplicitAny: false,
      outFile: "app.js"
    }))
    .pipe(sourcemaps.write('./.'))
    .pipe(gulp.dest('.temp/build/js'));
});

gulp.task('clean:dev', function() {
  return del([
    'build/Development/**/*'
  ]);
});

gulp.task('clean:prod', function() {
  return del([
    'build/Production/**/*'
  ]);
});

gulp.task('clean', function() {
  return del([
    '.temp',
    'build'
  ]);
});

gulp.task('copy:dev', ['tsc'], function() {
  return gulp.src(['.temp/build/**/*', 'index.html'])
    .pipe(gulp.dest('build/Development'));
});

gulp.task('copy:prod', ['tsc'], function() {
  return gulp.src(['.temp/build/**/*', 'index.html'])
    .pipe(gulp.dest('build/Production'));
})

gulp.task('build:dev', ['clean:dev', 'copy:dev'], function() {
  return gulp.src('node_*/**/*.*')
    .pipe(gulp.dest('build/Development'));
});

gulp.task('build:prod', ['clean:prod', 'copy:prod'], function() {
  return gulp.src('node_*/**/*.*')
    .pipe(gulp.dest('build/Production'));
});

gulp.task('build', ['build:dev', 'build:prod'], function() {});

gulp.task('watch:dev', ['build:dev'], function() {
  watch(['app/**/*', 'index.html'], function() {
    gulp.start('copy:dev');
  });
});

gulp.task('watch:prod', ['build:prod'], function() {
  watch(['app/**/*', 'index.html'], function() {
    gulp.start('copy:prod');
  })
});
