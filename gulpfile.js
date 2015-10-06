var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var inject = require('gulp-inject');
var wiredep = require('wiredep');
var clean = require('gulp-clean');
var mainBowerFiles = require('main-bower-files');
var filter = require('gulp-filter');
var bowerDir = 'bower_components';
var angularFilesort = require('gulp-angular-filesort');

var paths = {
  sass: ['./scss/**/*.scss'],
  modules: ['./www/modules/**/*.js', './www/modules/**/*.css']
};

var filterByExtension = function(){
  var re = '.' + arguments[0] + '$';
  for (var i = 1; i<arguments.length; i++) {
    re += '|.' + arguments[i] + '$';
  }
    return filter(function(file){
        return file.path.match(new RegExp(re));
    });
};


gulp.task('default', ['sass', 'index']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('index', ['lib-scripts', 'lib-css', 'lib-fonts'], function(){
  return gulp.src('./www/index.html')
    .pipe(inject(gulp.src('./www/modules/**/*.js').pipe(angularFilesort()), {relative: true}))
    .pipe(inject(gulp.src('./www/modules/**/*.css', {read: false}), {relative: true}))
    .pipe(wiredep.stream({
      fileTypes: {
        html: {
          replace: {
            js: function(filePath) {
              var pos = filePath.search(bowerDir+'/');
              if (pos === -1) {
                return '';
              }
              return '<script src="lib/' + filePath.substr(pos+(bowerDir+'/').length, filePath.length) + '"></script>';
            },
            css: function(filePath) {
              var pos = filePath.search(bowerDir+'/');
              if (pos === -1) {
                return '';
              }
              return '<link rel="stylesheet" href="lib/' + filePath.substr(pos+(bowerDir+'/').length, filePath.length) + '"/>';
            }
          }
        }
      }
    }))
    .pipe(gulp.dest('./www'));
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.modules, ['index']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});


gulp.task('clean-lib', function () {
    return gulp.src('www/lib', {read: false}).pipe(clean());
});

gulp.task('lib-scripts', ['install', 'clean-lib'], function() {
  return gulp.src(wiredep({directory: bowerDir}).js, {base: './'+bowerDir})
    .pipe(gulp.dest('www/lib'));
});

gulp.task('lib-css', ['install', 'clean-lib'], function() {
  return gulp.src(wiredep({directory: bowerDir}).css, {base: './'+bowerDir})
    .pipe(gulp.dest('www/lib'));
});

gulp.task('lib-fonts', ['install'], function(){
  var mainFiles = mainBowerFiles();
  if(!mainFiles.length){
      console.log('No fonts to copy');
      return;
  }
  console.log('Coping fonts...');
  gulp.src(mainFiles).pipe(filterByExtension('svg', 'ttf', 'woff', 'eot'))
    .pipe(gulp.dest('www/fonts'));
});
