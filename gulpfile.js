const { dest, series, src, watch, parallel } = require('gulp');
const babel = require('gulp-babel');
const browsersync = require('browser-sync').create();
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const replace = require('gulp-replace');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

const cleanupStyles = () => del(['./public/assets/css/*.css']);

const reload = (done) => {
  browsersync.reload();
  done();
};

const watchedFiles = () => {
  watch('./src/**/*.js', series(buildJavascript));
  watch('./src/**/*.scss', series(buildStyles));
  watch('**/*.html', reload);
  watch('**/*.json', reload);
};

const buildJavascript = () => {
  return src('./src/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./public/assets/js'))
    .pipe(browsersync.stream());
};

const buildStyles = () => {
  return src('./src/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('./public/assets/css'))
    .pipe(browsersync.stream());
};

const server = () => {
  browsersync.init({
    server: {
      baseDir: './public'
    },
    open: true
  });
};

/* ================================================= */
// Task for Production
/* ================================================= */
const cleanDist = () => del(['dist']);

const buildHTML = () => {
  return src('./public/*.html')
    .pipe(replace(new RegExp('assets/css', 'g'), 'css'))
    .pipe(replace(new RegExp('assets/js'), 'js'))
    .pipe(replace(new RegExp('assets/img', 'g'), 'img'))
    .pipe(dest('./dist/'));
};

const buildImages = () => {
  return src('./public/assets/img/**').pipe(dest('./dist/img'));
};

const buildCSS = () => {
  return src('./public/assets/css/**.css', { allowEmpty: true })
    .pipe(cleanCSS())
    .pipe(dest('./dist/css'));
};

const buildJavaScriptProd = () => {
  return src('./src/**/*.js')
    .pipe(babel())
    .pipe(uglify())
    .pipe(dest('./dist/js'));
};

exports.dev = series(parallel(watchedFiles, server));
exports.prod = series(
  cleanDist,
  parallel(
    buildHTML,
    buildImages,
    buildCSS,
    buildJavaScriptProd
  )
);
