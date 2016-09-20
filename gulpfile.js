const gulp        = require('gulp');
const install     = require('gulp-install');
const realFavicon = require('gulp-real-favicon');
const source 			= require('vinyl-source-stream');
const buffer      = require('vinyl-buffer');
const browserify  = require('browserify');
const watchify 		= require('watchify');
const uglify      = require('gulp-uglify');
const tsify       = require('tsify');
const fs          = require('fs');
const gulpTypings = require("gulp-typings");
const tsconfig 		= require('./tsconfig.json');
const FAVICON_DATA_FILE = 'faviconData.json';

gulp.task('generate-favicon', function(done) {
	realFavicon.generateFavicon({
		masterPicture: './crypt.svg',
		dest: 'dist/client/favicons',
		iconsPath: '/favicons',
		design: {
			ios: {
				pictureAspect: 'backgroundAndMargin',
				backgroundColor: '#352f2f',
				margin: '14%',
				assets: {
					ios6AndPriorIcons: false,
					ios7AndLaterIcons: false,
					precomposedIcons: false,
					declareOnlyDefaultIcon: true
				},
				appName: 'Crypt'
			},
			desktopBrowser: {},
			windows: {
				pictureAspect: 'noChange',
				backgroundColor: '#352f2f',
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: false,
					windows10Ie11EdgeTiles: {
						small: false,
						medium: true,
						big: false,
						rectangle: false
					}
				},
				appName: 'Crypt'
			},
			androidChrome: {
				pictureAspect: 'noChange',
				themeColor: '#352f2f',
				manifest: {
					name: 'Crypt',
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				},
				assets: {
					legacyIcon: false,
					lowResolutionIcons: false
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
		versioning: {
			paramName: 'v',
			paramValue: 'vMroeOKLRG'
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
		err = JSON.stringify(err, null, 2);
	}
	console.error(err);
}

function bundle(watch){
	var props = {debug:true};
	var b = watch ? watchify(browserify(props)) : browserify(props);
	b.add('src/client/src/main.ts')
	.plugin(tsify, tsconfig);
	function rebundle(){
		b.bundle()
		.on('error', handleTsErrors)
		.pipe(source('main.min.js'))
		// .pipe(buffer())
		// .pipe(uglify())
		.pipe(gulp.dest('./dist/client/app/'));
	}
	b.on('update', function() {
		console.log('Rebundling...');
		rebundle();
	});
	return rebundle();
}

gulp.task('browserify', ['install_client', 'install_typings'], function(){
	return bundle(false);
});

gulp.task('watchify', ['install_client', 'install_typings'], function(){
	return bundle(true);
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

gulp.task('install_typings', function(){
	return gulp.src("./typings.json")
  	.pipe(gulpTypings());
});

gulp.task('copy', ['copy_node', 'copy_client_root', 'copy_templates', 'copy_bootstrap']);
gulp.task('install', ['install_api', 'install_client', 'install_typings']);

gulp.task('watch', function(){
  console.log('watching for changes...');
  gulp.watch(['src/client/**/*.html'], ['copy_client_root', 'copy_templates']);
  gulp.watch(['./crypt.png'], ['inject-favicon-markups']);
  gulp.watch(['src/**/*', '!src/client/**/*'], ['copy_node']);
  gulp.watch(['./package.json'], ['install_api']);
  //gulp.watch(['src/client/package.json', 'src/client/src/**/*.ts'], ['install_client', 'browserify']);
	return bundle(true);
});

// Default Task
gulp.task('default', ['copy', 'inject-favicon-markups', 'install', 'browserify']);
