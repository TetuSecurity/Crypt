const gulp        	= require('gulp');
const install     	= require('gulp-install');
const ts 			= require('gulp-typescript');
const file 			= require('gulp-file');
const uglify      	= require('gulp-uglify');
const browserify  	= require('browserify');
const watchify 		= require('watchify');
const tsify       	= require('tsify');
// const stringify		= require('stringify');
// const sassify       = require('sassify');
// const source        = require('vinyl-source-stream');
const buffer      	= require('vinyl-buffer');
const factorBundle 	= require('factor-bundle');
const concat 		= require('concat-stream');
const fs          	= require('fs');
const path			= require('path');
const browserSync 	= require('browser-sync').create();
const client_tsc	= require('./src/client/tsconfig.json').compilerOptions;
const ts_project	= ts.createProject('./src/server/tsconfig.json');

const loaderify     = require('loaderify');

function handleTsErrors(err){
	if(typeof err != typeof ''){
		err = JSON.stringify(err, null, 2);
	}
	console.error(err);
}

function write (filepath) {    
    return concat(function (content) {        
        return file(path.basename(filepath), content, { src: true })
        .pipe(buffer())
		// .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist/client'));
    });
}

function initBrowserify(watch, options) {
    var props = Object.assign(options || {}, {
        debug: true,
        cache: {},
        packageCache: {}
    });
    var b = (watch ? watchify(browserify(props)) : browserify(props))
    .add('src/client/main.ts')
	.add('src/client/vendor.ts')
	.on('error', handleTsErrors)
	.plugin(tsify, client_tsc)
	.plugin(factorBundle, { outputs: [write('app.min.js'), write('vendor.min.js')]});
    return b;
}

function inject(contents, callback) {
    return callback(null, '`'+contents+'`');
}

function bundle(bundler){
    return bundler
    .transform(loaderify, {
        loaders: [
            {
                Pattern: '**/*.html', 
                Function: inject
            },
            {
                Pattern: '**/*.scss', 
                Function: inject
            },
            {
                Pattern: '**/*.css', 
                Function: inject
            }
        ]
    })
    .bundle()
    .pipe(write('common.min.js'));
}

gulp.task('browserify', ['install'], function(done){
    var b = initBrowserify(false, {});    
    return bundle(b).on('bundle', done);
});

gulp.task('watchify', function(){
    var w = initBrowserify(true, {});
    function rebundle(){
        bundle(w);
        browserSync.reload();
    }
    w.on('update', function(){
        console.log('Rebundling...');
        rebundle();
    });
    rebundle();
});

gulp.task('compile_node', ['install'], function(){
	return gulp.src('./src/server/**/*.ts')
	.pipe(ts_project()).js
	.pipe(gulp.dest('dist/server/'));
});

gulp.task('copy_client_root', function(){
  return gulp.src(['src/client/index.html', 'src/client/styles.css'])
      .pipe(gulp.dest('dist/client/'));
});

gulp.task('copy_client_assets', function(){
  return gulp.src(['src/client/assets/**/*'])
      .pipe(gulp.dest('dist/client/assets'));
});

gulp.task('copy_bootstrap', ['install'], function(){
	gulp.src(['!node_modules/bootstrap/dist/js/**','!node_modules/bootstrap/dist/js/','node_modules/bootstrap/dist/**'])
	.pipe(gulp.dest('dist/client/lib'));
});

gulp.task('install', function(){
	return gulp.src('./package.json')
    .pipe(install({production:true, ignoreScripts:true}));
});

gulp.task('copy', ['copy_client_root', 'copy_client_assets', 'copy_bootstrap']);

gulp.task('watch', ['copy', 'install', 'compile_node', 'watchify'], function(){
  	console.log('watching for changes...');
    browserSync.init({
        proxy: 'localhost:3000',
        port: '3001'
    });
	gulp.watch(['src/client/**/*.html'], ['copy_client_root']);
  	gulp.watch(['./package.json'], ['install']);
  	return gulp.watch(['./src/server/**/*.ts'], ['compile_node']);
});

// Default Task
gulp.task('default', ['copy', 'install', 'compile_node', 'browserify']);
