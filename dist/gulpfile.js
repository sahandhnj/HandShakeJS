/*jslint node: true */ // allow 'require' global
'use strict';
var tsconfig = require('./tsconfig.json');
var gulp = require('gulp'), concat = require('gulp-concat'), del = require('del'), util = require('gulp-util'), es = require('event-stream'), ts = require('gulp-typescript'), bump = require('gulp-bump'), git = require('gulp-git'), filter = require('gulp-filter'), tagVersion = require('gulp-tag-version'), inquirer = require('inquirer');
var sources = {
    app: {
        ts: tsconfig.filesGlob
    }
};
var destinations = {
    js: tsconfig.compilerOptions.outDir
};
gulp.task('compile', function () {
    var tsStream = gulp.src(sources.app.ts)
        .pipe(ts(tsconfig.compilerOptions));
    es.merge(tsStream.dts.pipe(gulp.dest(destinations.js)), tsStream.js
        .pipe(concat('main.js'))
        .pipe(gulp.dest(destinations.js)));
});
// deletes the dist folder for a clean build
gulp.task('clean', function () {
    del([destinations.js], function (err, deletedFiles) {
        if (deletedFiles.length) {
            util.log('Deleted', util.colors.red(deletedFiles.join(' ,')));
        }
        else {
            util.log(util.colors.yellow('/dist directory empty - nothing to delete'));
        }
    });
});
gulp.task('build', [
    'clean',
    'compile'
]);
gulp.task('bump', function () {
    return gulp.src(['./package.json'])
        .pipe(bump({ type: 'patch' }))
        .pipe(gulp.dest('./'))
        .pipe(git.commit('bump patch version'))
        .pipe(filter('package.json')) // read package.json for the new version
        .pipe(tagVersion()); // create tag
});
// watch scripts, styles, and templates
gulp.task('watch', function () {
    gulp.watch(sources.app.ts, ['compile']);
});
// default
gulp.task('default', ['build', 'watch']);
//# sourceMappingURL=gulpfile.js.map