/*jslint node: true */ // allow 'require' global
'use strict';
var tsconfig = require('./tsconfig.json'),
    webpackConfig = require('./webpack.config');
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    del = require('del'),
    util = require('gulp-util'),
    es = require('event-stream'),
    ts = require('gulp-typescript'),
    bump = require('gulp-bump'),
    git = require('gulp-git'),
    filter = require('gulp-filter'),
    tagVersion = require('gulp-tag-version'),
    inquirer = require('inquirer'),
    webpack = require('webpack');


var sources = {
    app: {
        ts: tsconfig.filesGlob
    }
};

var destinations = {
    js: tsconfig.compilerOptions.outDir
};

// deletes the dist folder for a clean build
gulp.task('clean', function() {
    del([destinations.js], function(err, deletedFiles) {
        if(deletedFiles.length) {
            util.log('Deleted', util.colors.red(deletedFiles.join(' ,')) );
        } else {
            util.log(util.colors.yellow('/dist directory empty - nothing to delete'));
        }
    });
});

gulp.task('bump', function() {
    return gulp.src(['./package.json'])
        .pipe(bump({type: 'patch'}))
        .pipe(gulp.dest('./'))
        .pipe(git.commit('bump patch version'))
        .pipe(filter('package.json'))  // read package.json for the new version
        .pipe(tagVersion());           // create tag
});

/*** TypeScript builds ***/
gulp.task('ts-compile', function() {
    var tsStream = gulp.src(sources.app.ts)
        .pipe(ts(tsconfig.compilerOptions));

    es.merge(
        tsStream.dts.pipe(gulp.dest(destinations.js)),
        tsStream.js
            .pipe(concat('main.js'))
            .pipe(gulp.dest(destinations.js))
    );
});

gulp.task('ts-build', [
    'clean',
    'ts-compile'
]);

// watch scripts, styles, and templates
gulp.task('ts-watch', function() {
    gulp.watch(sources.app.ts, ['ts-compile']);
});

// default
gulp.task('ts-default', ['ts-build', 'ts-watch']);


/*** WebPack Build ***/
gulp.task('webpack:build', ['clean'], function(callback) {
    var myConfig = Object.create(webpackConfig);
    myConfig.plugins = [
        new webpack.optimize.DedupePlugin(),
       // new webpack.optimize.UglifyJsPlugin()
    ];

    // run webpack
    webpack(myConfig, function(err, stats) {
        if (err) throw new gutil.PluginError('webpack', err);
        gutil.log('[webpack]', stats.toString({
            colors: true,
            progress: true
        }));
        callback();
    });
});

gulp.task("build", ["clean","webpack:build"]);
gulp.task("default", ["build"]);



/*** Dev Build In order to get the map ***/
// modify some webpack config options
var myDevConfig = Object.create(webpackConfig);
myDevConfig.devtool = "sourcemap";
//myDevConfig.debug = true;

// create a single instance of the compiler to allow caching
var devCompiler = webpack(myDevConfig);

gulp.task("webpack:build-dev", function(callback) {
    // run webpack
    devCompiler.run(function(err, stats) {
        if(err) throw new gutil.PluginError("webpack:build-dev", err);
        gutil.log("[webpack:build-dev]", stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task("build-dev", ["clean","webpack:build-dev"], function() {
    gulp.watch(["app/**/*"], ["webpack:build-dev"]);
});
