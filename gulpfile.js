// Gulpfile developed from:
// https://github.com/zellwk/gulp-starter-csstricks
// https://github.com/roots/sage
// http://justinmccandless.com/post/a-tutorial-for-getting-started-with-gulp

const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass')); // ✅ This sets the compiler
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const cssnano = require('gulp-cssnano');
const imagemin = require('gulp-imagemin');
const cache = require('gulp-cache');
//New
const del = require('del');
const browserSync = require('browser-sync').create();

// Development Tasks
// -----------------


gulp.task('sass', function() {
  return gulp.src('scss/**/*.scss') // Gets all files ending with .scss in main.css.source/styles and children dirs
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError)) // Passes it through gulp-sass and deal with errors
    .pipe(autoprefixer({ cascade: false }))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('css/')) // Outputs it in the css folder
    .pipe(browserSync.stream());
})

gulp.task('sass:production', function() {
  return gulp.src('scss/**/*.scss') // Gets all files ending with .scss in main.css.source/styles and children dirs
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError)) // Passes it through a gulp-sass
    .pipe(autoprefixer({ cascade: false }))
    .pipe(gulpIf('*.css', cssnano())) // Minify css
    .pipe(gulp.dest('dist/')); // Outputs it in the css folder
})

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
gulp.task('images', function() {
  return gulp.src('../../images/**/*.+(png|jpg|jpeg|gif|svg)')
    // Caching images that ran through imagemin
    .pipe(cache(imagemin({
      interlaced: true,
    })))
    .pipe(gulp.dest('../../images'))
});

// Build Sequences
// ---------------

gulp.task('clear', function (done) {
  return cache.clearAll(done);
})


// Clean dist folder
gulp.task('clean', function () {
  return del(['dist']);
});


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