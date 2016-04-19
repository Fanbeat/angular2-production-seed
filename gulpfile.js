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

/**
 * Autoprefix, compress, and compile the LESS
 * Compiled CSS is output to the same directory as the LESS
 * so it can be easily injected into the component when building
 */
gulp.task('less', function() {
  return gulp.src('app/**/*.less')
    .pipe(less({ compress: true, plugins: [autoprefix] }))
    .pipe(gulp.dest('app'));
});

/**
 * Insert the HTML templates and compiled CSS directly into the TypeScript components
 * Without this, the browser would have to make separate calls for each file
 */
gulp.task('inline-templates', ['less'], function() {
  return gulp.src('app/**/*.ts')
    .pipe(inlineNg2Template({
      base: '/app',
      useRelativePaths: true,
      removeLineBreaks: true }))
    .pipe(gulp.dest('.temp'));
});

/**
 * Compile the TypeScript components from .temp and output a 
 * single app.js file
 * This should include every component with inline templates and styles
 */
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

/**
 * Clean build artifacts from the previous dev build
 */
gulp.task('clean:dev', function() {
  return del([
    'build/Development/**/*'
  ]);
});

/**
 * Clean build artificts from the previous production build
 */
gulp.task('clean:prod', function() {
  return del([
    'build/Production/**/*'
  ]);
});

/**
 * Clean build artifacts from the previous dev and production builds
 */
gulp.task('clean', function() {
  return del([
    '.temp',
    'build'
  ]);
});

/**
 * Copy index.html and the compiled app.js into the dev output directory
 */
gulp.task('copy:dev', ['tsc'], function() {
  return gulp.src(['.temp/build/**/*', 'index.html'])
    .pipe(gulp.dest('build/Development'));
});

/**
 * Copy index.html and the compiled app.js into the production output directory
 */
gulp.task('copy:prod', ['tsc'], function() {
  return gulp.src(['.temp/build/**/*', 'index.html'])
    .pipe(gulp.dest('build/Production'));
})

/**
 * Clean and build for dev
 */
gulp.task('build:dev', ['clean:dev', 'copy:dev'], function() {
  return gulp.src('node_*/**/*.*')
    .pipe(gulp.dest('build/Development'));
});

/**
 * Clean and build for production
 */
gulp.task('build:prod', ['clean:prod', 'copy:prod'], function() {
  return gulp.src('node_*/**/*.*')
    .pipe(gulp.dest('build/Production'));
});

/**
 * Clean and build for dev and production
 */
gulp.task('build', ['build:dev', 'build:prod'], function() {});

/**
 * Build for dev and recompile when source files change (TypeScript, HTML, or LESS)
 */
gulp.task('watch:dev', ['build:dev'], function() {
  watch(['app/**/*', 'index.html'], function() {
    gulp.start('copy:dev');
  });
});

/**
 * Build for production and recompile when source files change (TypeScript, HTML, or LESS)
 */
gulp.task('watch:prod', ['build:prod'], function() {
  watch(['app/**/*', 'index.html'], function() {
    gulp.start('copy:prod');
  })
});
