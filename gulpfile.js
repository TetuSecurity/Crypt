const gulp        	= require('gulp');
const install     	= require('gulp-install');
const ts 			= require('gulp-typescript');
const buffer      	= require('vinyl-buffer');
const fs          	= require('fs');
const path			= require('path');
const sass          = require('node-sass');
const minify        = require('minify');
const client_tsc	= require('./src/client/tsconfig.json').compilerOptions;
const server_tsc	= require('./src/server/tsconfig.json').compilerOptions;
const ts_project	= ts.createProject('./src/server/tsconfig.json');
const webpack       = require('webpack');

function sassNodeModulesImporter(url, file, done){
    // if it starts with a tilde, search in node_modules;
    if (url.indexOf('~') === 0){
        var nmPath = path.join(__dirname, 'node_modules', url.substring(1)||'');
        return done({ file: nmPath });
    } else {
        return done({ file: url });
    }
}

gulp.task('compile_node', ['install'], function(){
	return gulp.src('./src/server/**/*.ts')
	.pipe(ts_project()).js
	.pipe(gulp.dest('dist/server/'));
});

gulp.task('copy_client_root', ['copy_client_assets', 'install'], function(done){
    gulp.src(
        [
            'src/client/index.html', 
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/tether/dist/js/tether.min.js'
        ]
    )
    .pipe(gulp.dest('dist/client/'));
    sass.render({
        file: 'src/client/styles.scss',
        outputStyle: 'compressed',
        importer: sassNodeModulesImporter
    }, function(err, result){
        if(err){
            throw err;
        }
        fs.writeFileSync('dist/client/styles.min.css', result.css);
        done();
    });
});

gulp.task('copy_client_assets', function(){
  return gulp.src(['src/client/assets/**/*'])
      .pipe(gulp.dest('dist/client/assets'));
});

gulp.task('copy_fonts', ['install', 'copy_client_assets'], function(){
  return gulp.src(['node_modules/font-awesome/fonts/*', 'src/client/fonts/*'])
      .pipe(gulp.dest('dist/client/fonts'));
});

gulp.task('install', function(){
	return gulp.src('./package.json')
    .pipe(install({ignoreScripts:true}));
});

gulp.task('copy', ['copy_client_root', 'copy_client_assets', 'copy_fonts']);

gulp.task('watch', ['copy', 'install', 'compile_node'], function(){
  	console.log('watching for changes...');
	gulp.watch(['src/client/**/*'], ['copy']);
  	return gulp.watch(['./package.json'], ['browserify']);
});

gulp.task('webpack', ['install'], function(done) {
    return webpack(require('./webpack.config'), function(err){
        if (err) {
            console.log(err);
        }
        return done(err);
    });
});

// Default Task
gulp.task('default', ['copy', 'install', 'compile_node', 'webpack']);
