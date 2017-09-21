'use strict';

// Dependencies
// ----------------------------------------------------------------------------
var
	autoprefixer = require('gulp-autoprefixer'),				// CSS Vendor Prefixing
	cleanCSS = require('gulp-clean-css'),								// Cleans up CSS
	connect = require('gulp-connect'),									// Live Reload Server
	del = require('del'),																// Deletes Files
	gulp = require('gulp'),															// GULP
	gulps = require("gulp-series"),											// Groups & Orders exicutible actions
	path = require('path'),															// Directory variables
	plumber = require('gulp-plumber'),									// Continues watching files after an error
	PrettyError = require('pretty-error'),							// Tidies errors in the console
	rename = require('gulp-rename'),										// Renames Files
	sass = require('gulp-sass'),												// Compiles SASS to CSS
	util = require('gulp-util'),												// General tools, colours & error logging
	child = require('child_process'),										//
	gulp = require('gulp')															// General
;
var pe = new PrettyError();
pe.start();
function magicUpperCaseConvert() {};





// Path Directories
// ----------------------------------------------------------------------------
var paths = {

	// Directories
	sass:										'./sass/',
	dev:										'./',
	build:									'./_site/',

	// Jekyll
	jekyll_includes:				'./_includes/',
	jekyll_css:							'./**/*.css',

	// Sass Files
	sass_source_inline:			'./sass/inline.scss',
	sass_source_build:			'./sass/style.scss',
	sass_source_dev:				'./sass/style-dev.scss',

	// Build
	build_css:							'./_site/*.css',
	build_html:							'./_site/*.html'
};





// Tasks (Gulp Series)
// ----------------------------------------------------------------------------

////
//// DEVELOPMENT
////
// sass
gulp.task('convert_dev_sass', function() {
		gulp.src(paths.sass_source_dev)
		.pipe(plumber())

		// Format
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))

		.pipe(rename({basename: 'style'}))

		// Export
		.pipe(gulp.dest(paths.dev))

		console.log(util.colors.blue.bold('\n[DEV] Compiling SASS\n'))
});
// watch
gulp.task('watch_dev', function() {
		gulp.watch(paths.sass, 							["convert_dev_sass"])
		//gulp.watch(paths.build_html, 				["updated_dev"])
		gulp.watch(paths.build_css, 				["updated_dev"])

		console.log(util.colors.blue.bold('\n[DEV] Watching...\n'))

});
// update
gulp.task('updated_dev', function() {

		gulp.src(paths.build_serve)
		.pipe(connect.reload(
			console.log(util.colors.blue.bold('\n[DEV] UPDATED!\n'))
		)) // Reload Browser
});

////
//// BUILD
////
// sass
gulp.task('convert_build_sass_inline', function() {
		gulp.src(paths.sass_source_inline)
		.pipe(plumber())

		// Prefix & Compress
		//.pipe(autoprefixer('last 2 versions'))
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))

		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: true
		}))

		// Export
		.pipe(gulp.dest(paths.jekyll_includes))

		console.log(util.colors.yellow.bold('\n[BUILD] Compiling SASS\n')
	)
});
gulp.task('convert_build_sass', function() {
		gulp.src(paths.sass_source_build)
		.pipe(plumber())

		// Prefix & Compress
		//.pipe(autoprefixer('last 2 versions'))
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))

		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: true
		}))

		// Export
		.pipe(gulp.dest(paths.dev))

		console.log(util.colors.yellow.bold('\n[BUILD] Compiling inline SASS\n')
	)
});
// watch
gulp.task('watch_build', function() {
		gulp.watch(paths.sass, 										["convert_build_sass","convert_build_sass_inline"])
		gulp.watch(paths.build_html, 							["updated_build"])
		gulp.watch(paths.build_css, 							["updated_build"])


		done(
			console.log(util.colors.yellow.bold('[BUILD] Watching...'))
		);
});
// update
gulp.task('updated_build', function() {
		gulp.src(paths.build_serve)
		.pipe(connect.reload(
			console.log(util.colors.green.bold('[BUILD] UPDATED!'))
		))
});

////
//// Jekyll
////
gulp.task('killjekyll', function() {

		const killjekyll = child.spawn('pkill', [
			'-F',
			'--jekyll'
		]);

		const killjekylltwo = child.spawn('kill', [
			'-9',
			'18659'
		]);
});

gulp.task('jekyll', function() {
		const jekyll = child.spawn('jekyll', [
			'serve',
			'--watch',
			'--detach',
			'--incremental'
			//'--drafts',
			//'--port 9876'
		]);

		const jekyllLogger = (buffer) => {
			buffer.toString()
				.split(/\n/)
				.forEach((message) => util.log('Jekyll: ' + message));
		};

		jekyll.stdout.on('data', jekyllLogger);
		jekyll.stderr.on('data', jekyllLogger);
});
gulp.task('jekyll_build', function() {
		const jekyll = child.spawn('jekyll', [
			'build',
			'--drafts'
		]);

		const jekyllLogger = (buffer) => {
			buffer.toString()
				.split(/\n/)
				.forEach((message) => util.log('Jekyll: ' + message));
		};

		jekyll.stdout.on('data', jekyllLogger);
		jekyll.stderr.on('data', jekyllLogger);
});

////
//// Server
////
gulp.task('connect', function() {

		connect.server({
			root: paths.build,
			livereload: 'true'
		});

		done(
			console.log(util.colors.green.bold('\nConnected...\n'))
		);
});

////
//// Clean
////
gulp.task('clean_css', function() {

		const del = require('del');
		del(['./style.css', 'style-dev.css', './_includes/inline.css', './inline.css'], {force: true}).then(paths => {
			console.log(
				util.colors.red('\nAll [CSS] files in '), util.colors.bold.red('Jekyll'), util.colors.red('deleted!\n'), util.colors.magenta( paths.join('\n'))
			);
		});
});

////
//// Serve CSS
////
gulp.task('compress_css', function() {
		gulp.src(paths.build_css)

		.pipe(plumber())

		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: true
		}))

		.pipe(cleanCSS({compatibility: 'ie8'})) // Running the plugin

			 .pipe(cleanCSS({debug: true}, function(details) {
				 console.log(util.colors.yellow.bold('\nMinifying CSS...\n'))
				 console.log(util.colors.white(details.name) + util.colors.white.bold(' Original = ') + util.colors.yellow(details.stats.originalSize));
				 console.log(util.colors.white(details.name) + util.colors.white.bold(' Minified = ') + util.colors.green.bold(details.stats.minifiedSize));
					 console.log(util.colors.bold('\n'))
			 }))

		// Export
		.pipe(gulp.dest(paths.build_css))

		console.log(util.colors.yellow.bold('\nCSS Prefixed & Compressed\n'))
});





// Execute Tasks
// ----------------------------------------------------------------------------
gulp.task('default', function() {
	console.log(util.colors.green.bold('OllieJT Quickstart: ') + util.colors.red.bold('Learn more here ') + util.colors.blue('https://github.com/OllieJT/quickstart'))
});

gulp.task('jekyll',
	[
		// Jekyll
		'killjekyll',
		'jekyll'

	], function() {
	console.log(util.colors.green.bold('DEV MODE: ') + util.colors.white.bold('ENABLED') + util.colors.red.bold(' Watching...'))
});

gulp.task('dev',
	[
		// CSS
		'clean_css',
		'convert_dev_sass',
		'convert_build_sass_inline',

		// Localhost
		//"connect",
		'killjekyll',
		'jekyll',
		'watch_dev'

	], function() {
	console.log(util.colors.green.bold('DEV MODE: ') + util.colors.white.bold('ENABLED') + util.colors.red.bold(' Watching...'))
});

gulp.task('serve',
	[
		// CSS
		'clean_css',
		'convert_build_sass',
		'convert_build_sass_inline',

		// Localhost
		//"connect",
		'killjekyll',
		'jekyll',
		'watch_dev'

	], function() {
	console.log(util.colors.green.bold('DEV MODE: ') + util.colors.white.bold('ENABLED') + util.colors.red.bold(' Watching...'))
});

gulp.task('build',
	[
		// CSS
		'clean_css',
		'convert_build_sass',
		'convert_build_sass_inline',

		// Jekyll
		'jekyll_build',

		// Compress CSS
		'compress_css'

	], function() {
	console.log(util.colors.green.bold('PUBLISH: ') + util.colors.white.bold('COMPLETED') + util.colors.red.bold('Watching...'))
});





// Pretty Error
// ----------------------------------------------------------------------------
pe.appendStyle({
   // this is a simple selector to the element that says 'Error'
   'pretty-error > header > title > kind': {
      // which we can hide:
      display: 'none'
   },

   // the 'colon' after 'Error':
   'pretty-error > header > colon': {
      // we hide that too:
      display: 'none'
   },

   // our error message
   'pretty-error > header > message': {
      // let's change its color:
      color: 'bright-white',

      // we can use black, red, green, yellow, blue, magenta, cyan, white,
      // grey, bright-red, bright-green, bright-yellow, bright-blue,
      // bright-magenta, bright-cyan, and bright-white

      // we can also change the background color:
      background: 'cyan',

      // it understands paddings too!
      padding: '0 1' // top/bottom left/right
   },

   // each trace item ...
   'pretty-error > trace > item': {
      // ... can have a margin ...
      marginLeft: 2,

      // ... and a bullet character!
      bullet: '"<grey>o</grey>"'

      // Notes on bullets:
      //
      // The string inside the quotation mark gets used as the character
      // to show for the bullet point.
      //
      // You can set its color/background color using tags.
      //
      // This example sets the background color to white, and the text color
      // to cyan, the character will be a hyphen with a space character
      // on each side:
      // example: '"<bg-white><cyan> - </cyan></bg-white>"'
      //
      // Note that we should use a margin of 3, since the bullet will be
      // 3 characters long.
   },

   'pretty-error > trace > item > header > pointer > file': {color: 'bright-cyan'},
   'pretty-error > trace > item > header > pointer > colon': {color: 'cyan'},
   'pretty-error > trace > item > header > pointer > line': {color: 'bright-cyan'},
   'pretty-error > trace > item > header > what': {color: 'bright-white'},
   'pretty-error > trace > item > footer > addr': {display: 'none'}
});

// Test Console Error
// ----------------------------------------------------------------------------
gulp.task('console', function(){
	console.log(util.colors.blue('This') + ' is ' + util.colors.red('now') + util.colors.green(' working'))
});
