var gulp        = require('gulp');
var install     = require('gulp-install');
var realFavicon = require('gulp-real-favicon');
var source 			= require('vinyl-source-stream');
var buffer      = require('vinyl-buffer');
var browserify  = require('browserify');
var uglify      = require('gulp-uglify');
var tsify       = require('tsify');
var fs          = require('fs');
var FAVICON_DATA_FILE = 'faviconData.json';

gulp.task('generate-favicon', function(done) {
	realFavicon.generateFavicon({
		masterPicture: './crypt.png',
		dest: 'dist/client/favicons',
		iconsPath: '/favicons',
		design: {
			ios: {
				pictureAspect: 'backgroundAndMargin',
				backgroundColor: '#352f2f',
				margin: '21%'
			},
			desktopBrowser: {},
			windows: {
				pictureAspect: 'noChange',
				backgroundColor: '#352f2f',
				onConflict: 'override'
			},
			androidChrome: {
				pictureAspect: 'backgroundAndMargin',
				margin: '17%',
				backgroundColor: '#352f2f',
				themeColor: '#ffffff',
				manifest: {
					name: 'Crypt',
					display: 'browser',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				}
			},
			safariPinnedTab: {
				pictureAspect: 'silhouette',
				themeColor: '#01cccc'
			}
		},
		settings: {
			compression: 5,
			scalingAlgorithm: 'Cubic',
			errorOnImageTooSmall: false
		},
		markupFile: FAVICON_DATA_FILE
	}, function() {
		done();
	});
});

gulp.task('inject-favicon-markups', ['generate-favicon', 'copy_client_root'],function() {
	gulp.src('dist/client/index.html')
		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
		.pipe(gulp.dest('dist/client/'));
});

gulp.task('check-for-favicon-update', function(done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
});

function handleTsErrors(err){
	if(typeof err != typeof ''){
		err = JSON.stringify(err);
	}
	console.error(err);
}

gulp.task('browserify', ['install_client'], function(){
	return browserify({
		debug: true
	}).add('src/client/src/main.ts')
	.plugin(tsify, {target:'es5', project:'./tsconfig.json'})
	.bundle()
	.on('error', handleTsErrors)
	.pipe(source('main.min.js'))
	.pipe(buffer())
	.pipe(uglify())
	.pipe(gulp.dest('./dist/client/app/'));
});

gulp.task('copy_templates', function(){
  return gulp.src(['src/client/templates/*.html'])
      .pipe(gulp.dest('dist/client/templates'));
});

gulp.task('copy_client_root', function(){
  return gulp.src(['src/client/index.html'])
      .pipe(gulp.dest('dist/client/'));
});

gulp.task('copy_node', function(){
  return gulp.src(['src/**/*', '!src/client/**/*', './package.json', '!./node_modules', '!./config.json'])
      .pipe(gulp.dest('dist/'));
});

gulp.task('copy_bootstrap', ['install_client'], function(){
	gulp.src(['!src/client/node_modules/bootstrap/dist/js/**','!src/client/node_modules/bootstrap/dist/js/','src/client/node_modules/bootstrap/dist/**'])
	.pipe(gulp.dest('dist/client/lib'));
});

gulp.task('install_api', ['copy_node'], function(){
  return gulp.src('dist/package.json')
    .pipe(install({production:true, ignoreScripts:true}));
});

gulp.task('install_client', function(){
  return gulp.src('src/client/package.json')
    .pipe(install({production:true, ignoreScripts:true}));
});

gulp.task('copy', ['copy_node', 'copy_client_root', 'copy_templates', 'copy_bootstrap']);
gulp.task('install', ['install_api', 'install_client']);

gulp.task('watch', function(){
  console.log('watching for changes...');
  gulp.watch(['src/client/src/**/*.ts'], ['browserify']);
  gulp.watch(['src/client/**/*.html'], ['copy_client_root', 'copy_templates']);
  gulp.watch(['./crypt.png'], ['inject-favicon-markups']);
  gulp.watch(['src/**/*', '!src/client/**/*'], ['copy_node']);
  gulp.watch(['./package.json'], ['install_api']);
  return gulp.watch(['src/client/package.json'], ['install_client', 'browserify']);
});

// Default Task
gulp.task('default', ['copy', 'inject-favicon-markups', 'install', 'browserify']);
