// Import necessary modules
const gulp = require('gulp');
const del = require('del');
const ts = require('gulp-typescript');
const bump = require('gulp-bump');
const git = require('gulp-git');
const filter = require('gulp-filter');
const tagVersion = require('gulp-tag-version');
const concat = require('gulp-concat');
const log = require('fancy-log');
const colors = require('ansi-colors');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const tsconfig = require('./tsconfig.json');
const webpackConfig = require('./webpack.config');

const sources = {
    app: {
        ts: tsconfig.include,
    }
};
const destinations = {
    js: tsconfig.compilerOptions.outDir,
};

function clean() {
    return del([destinations.js]).then(deletedFiles => {
        if (deletedFiles.length) {
            log('Deleted', colors.red(deletedFiles.join(', ')));
        } else {
            log(colors.yellow('Directory clean. No files deleted.'));
        }
    });
}

function bumpVersion() {
    return gulp.src(['./package.json', './bower.json'])
        .pipe(bump({type: 'patch'}))
        .pipe(gulp.dest('./'))
        .pipe(git.commit('Bump patch version'))
        .pipe(filter('package.json'))
        .pipe(tagVersion());
}

function tsCompile() {
    const tsProject = ts.createProject('tsconfig.json');
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(concat('main.js'))
        .pipe(gulp.dest(destinations.js));
}

function tsWatch() {
    gulp.watch(sources.app.ts, tsCompile);
}

function webpackBuild(callback) {
    webpack(webpackConfig, (err, stats) => {
        if (err) throw new log.error('webpack', err);
        log('[webpack]', stats.toString({
            colors: true
        }));
        callback();
    });
}

function webpackBuildDev(callback) {
    const myDevConfig = Object.assign({}, webpackConfig, { devtool: 'sourcemap' });
    const devCompiler = webpack(myDevConfig);

    devCompiler.run((err, stats) => {
        if (err) throw new log.error('webpack:build-dev', err);
        log('[webpack:build-dev]', stats.toString({ colors: true }));
        callback();
    });
}

function devWatch() {
    gulp.watch(['app/**/*'], webpackBuildDev);
}

const tsBuild = gulp.series(clean, tsCompile);
const build = gulp.series(clean, webpackBuild);
const buildDev = gulp.series(clean, webpackBuildDev, devWatch);

exports.clean = clean;
exports.bump = bumpVersion;
exports['ts-compile'] = tsCompile;
exports['ts-build'] = tsBuild;
exports['ts-watch'] = tsWatch;
exports.build = build;
exports['build-dev'] = buildDev;
exports.default = build;
