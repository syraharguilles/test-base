// Gulpfile developed from:
// https://github.com/zellwk/gulp-starter-csstricks
// https://github.com/roots/sage
// http://justinmccandless.com/post/a-tutorial-for-getting-started-with-gulp

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const cssnano = require('gulp-cssnano');
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
const del = require('del');
const browserSync = require('browser-sync').create();
const rename = require('gulp-rename'); // ✅ Add this to avoid errors

// Development Tasks
// -----------------

function buildCoreDev() {
  return gulp.src('scss/core.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(sourcemaps.write('../maps'))
    .pipe(rename('core.css'))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());
}

function buildVendorDev() {
  return gulp.src('scss/vendor.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(sourcemaps.write('../maps'))
    .pipe(rename('vendor.css'))
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());
}

gulp.task('sass', gulp.parallel(buildCoreDev, buildVendorDev));

// Watch SCSS + HTML and reload
gulp.task('serve', function () {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });

  gulp.watch('scss/**/*.scss', gulp.series('sass'));
  gulp.watch('./*.html').on('change', browserSync.reload);
});

// Optimization Tasks
// ------------------

// Optimizing Images
gulp.task('images', function () {
  return gulp.src('../../images/**/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(cache(imagemin({
      interlaced: true,
    })))
    .pipe(gulp.dest('../../images'));
});

// Clean dist folder
gulp.task('clean', function () {
  return del(['dist']);
});

// Clear cache
gulp.task('clear', function (done) {
  return cache.clearAll(done);
});

// Production Tasks
// ----------------

function buildCoreProd() {
  return gulp.src('scss/core.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cssnano())
    .pipe(rename('core.css'))
    .pipe(gulp.dest('dist/'));
}

function buildVendorProd() {
  return gulp.src('scss/vendor.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(cssnano())
    .pipe(rename('vendor.css'))
    .pipe(gulp.dest('dist/'));
}

gulp.task('sass:production', gulp.parallel(buildCoreProd, buildVendorProd));

// Build Sequences
// ---------------

// Dev: compile sass and watch
gulp.task('default', gulp.series('sass', 'serve'));

// Compile + watch only SCSS
gulp.task('sass:only', gulp.series('sass', function watchSassOnly() {
  gulp.watch('scss/**/*.scss', gulp.series('sass'));
}));

// Build for dev (css + images)
gulp.task('build', gulp.series('clean', gulp.parallel('sass', 'images')));

// Build for production (minified css only)
gulp.task('build:production', gulp.series('clean', 'sass:production'));
