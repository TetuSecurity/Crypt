var gulp        = require('gulp');
var uncss       = require('gulp-uncss');
var uglify      = require('gulp-uglify');
var nano        = require('gulp-cssnano');
var usemin      = require('gulp-usemin');
var tsc         = require('gulp-typescript');
var typings     = require('gulp-typings');
var install     = require('gulp-install');

gulp.task('tscompile', function(){
  return gulp.src(['src/client/src/*.ts', '!*.d.ts'])
  .pipe(tsc({
    "target": "es3",
    "module": "commonjs",
    "moduleResolution": "node",
    "sourceMap": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "removeComments": false,
    "noImplicitAny": false
  })).pipe(gulp.dest('dist/client/app'));
});

gulp.task('usemin', function(){
  return gulp.src('src/client/index.html')
    .pipe(usemin({
        js: [uglify(), 'concat'],
        css: [uncss({html:['src/client/index.html', 'src/client/templates/*.html'], ignore:[]}), nano(), 'concat']
      })
    )
    .pipe(gulp.dest('dist/client'));
});

gulp.task('copy_templates', function(){
  return gulp.src(['src/client/templates/*.html'])
      .pipe(gulp.dest('dist/client/templates'));
});

gulp.task('copy_client_root', function(){
  return gulp.src(['src/client/favicon.ico', 'src/client/index.html', 'src/client/package.json', 'src/client/typings.json', 'src/client/systemjs.config.js'])
      .pipe(gulp.dest('dist/client/'));
});

gulp.task('copy_node', function(){
  return gulp.src(['src/**/*', '!src/client/**/*', './package.json', '!./node_modules', '!./config.json'])
      .pipe(gulp.dest('dist/'));
});

gulp.task('install_api', ['copy_node'], function(){
  return gulp.src('dist/package.json')
    .pipe(install({production:true, ignoreScripts:true}));
});

gulp.task('install_client', ['copy_client_root'], function(){
  return gulp.src('dist/client/package.json')
    .pipe(install({production:true, ignoreScripts:true}));
});

gulp.task('install_client_typings', ['copy_client_root', 'install_client'], function(){
  return gulp.src('dist/client/typings.json')
    .pipe(typings());
});

gulp.task('watch', function(){
  console.log('watching for ts changes...');
  return gulp.watch(['src/client/src/*.ts', 'src/client/**/*.html'], ['tscompile', 'copy_client_root', 'copy_templates']);
});

// Default Task
gulp.task('default', ['copy_node', 'copy_client_root', 'copy_templates', 'tscompile', 'install_api', 'install_client', 'install_client_typings']);
