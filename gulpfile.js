'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var modRewrite = require('connect-modrewrite');
var psi = require('psi');
var reload = browserSync.reload;
var rev = require('gulp-rev');
var sass = require('gulp-ruby-sass');
var fingerprint = require('gulp-fingerprint');
var path = require('path');
var vinylPaths = require('vinyl-paths');
var concat = require('gulp-concat');
var assets = require('./assets');


// psi
var site = 'https://pqstudio.pl';
var key = '';

var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

// Lint JavaScript
gulp.task('jshint', function() {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe(reload({
            stream: true,
            once: true
        }))
});

// Optimize Images
gulp.task('images', function() {
    return gulp.src('app/images/**/*')
        .pipe($.imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size({
            title: 'images'
        }));
});

// Copy All Files At The Root Level (app)
gulp.task('copy', function() {
    return gulp.src([
            'app/*',
            '!app/*.html',
            '!app/scripts',
            'node_modules/apache-server-configs/dist/.htaccess'
        ], {
            dot: true
        }).pipe(gulp.dest('dist'))
        .pipe($.size({
            title: 'copy'
        }));
});

// Copy Web Fonts To Dist
gulp.task('fonts', function() {
    return gulp.src(['app/fonts/**'])
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.size({
            title: 'fonts'
        }));
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function() {
    // For best performance, don't add Sass partials to `gulp.src`
    return gulp.src([
            'app/styles/main.scss'
        ])
        .pipe($.changed('styles', {
            extension: '.scss'
        }))
        .pipe(sass({
            style: 'expanded',
            "sourcemap=none": true //hack to allow autoprefixer to work
        }))
        .on('error', console.error.bind(console))
        .pipe($.autoprefixer({
            browsers: AUTOPREFIXER_BROWSERS
        }))
        .pipe(gulp.dest('.tmp/styles'))
        // Concatenate And Minify Styles
        // .pipe($.if('*.css', $.uncss({
        //     html: [
        //     ],
        //     // CSS Selectors for UnCSS to ignore
        //     ignore: [
        //     ]
        // })))
        .pipe($.if('*.css', $.csso(true)))
        .pipe(gulp.dest('dist/styles'))
        .pipe($.size({
            title: 'styles'
        }));
});

gulp.task('scripts', function() {
    return gulp.src(assets.js)
        .pipe($.if('*.js', $.uglify({
            mangle: false
        })))
        .pipe($.concat('app.js'))
        .pipe(gulp.dest('.tmp/assets/scripts'));
});

gulp.task('scripts-dist', function() {
    return gulp.src(assets.js)
        .pipe($.if('*.js', $.uglify({
            mangle: false
        })))
        .pipe($.concat('app.js'))
        .pipe(gulp.dest('dist/assets/scripts'));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function() {
    var assets = $.useref.assets({
        searchPath: '{.tmp,app}'
    });

    // Minify html options, all defaults
    var opts = {
        empty: false,
        cdata: false,
        comments: false,
        conditionlas: false,
        spare: false,
        qutoes: false
    };

    return gulp.src('app/**/*.html')
        .pipe(assets)
        // Concatenate And Minify JavaScript
        // .pipe($.if('*.js', $.uglify({
        //     preserveComments: 'some',
        //     mangle: false
        // })))
        // Remove Any Unused CSS
        // Note: If not using the Style Guide, you can delete it from
        // the next line to only include styles your project uses.

    // Concatenate And Minify Styles
    // In case you are still using useref build blocks
    .pipe(assets.restore())
        // .pipe($.useref())
        // Minify Any HTML
        .pipe($.if('*.html', $.minifyHtml(opts)))
        // Output Files
        .pipe(gulp.dest('dist'))
        .pipe($.size({
            title: 'html'
        }));
});

gulp.task('fingerprint', function() {
    return gulp.src(['dist/styles/*.css', 'dist/assets/scripts/*.js', 'dist/images/*.*'], {
            base: path.join(process.cwd(), 'dist')
        }).pipe(vinylPaths(del))
        .pipe(rev())
        .pipe(gulp.dest('dist'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('.tmp'))
        .pipe($.size({
            title: 'fingerprint'
        }));
});

gulp.task('fingerprint-replace', function() {
    var options = {
        regex: /(?:url\(["']?(.*?)['"]?\)|src=["'](.*?)['"]|src=([^\s\>]+)(?:\>|\s)|src:["'](.*?)['"]|src:([^\s\>]+)(?:\>|\s)|href=["'](.*?)['"]|href=([^\s\>]+)(?:\>|\s))/g,
        prefix: '/',
        verbose: false
    };

    var manifest = require(__dirname + '/.tmp/rev-manifest');

    return gulp.src(['dist/styles/*.css', 'dist/*.html'], {
            base: 'dist'
        })
        .pipe(fingerprint(manifest, options))
        .pipe(gulp.dest('dist'));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

// Watch Files For Changes & Reload
gulp.task('serve', ['styles', 'scripts'], function() {
    browserSync({
        notify: false,
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: {
            baseDir: ['.tmp', 'app'],
            middleware: [
                modRewrite(['!\.html|\.js|\.css|\.png|\.jpg|\.svg|\.gif$ /index.html [L]'])
            ]
        }
    });

    gulp.watch(['app/**/*.html'], reload);
    gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
    gulp.watch(['app/scripts/**/*.js'], ['jshint', 'scripts']);
    gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function() {
    browserSync({
        notify: false,
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: 'dist'
    });
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function(cb) {
    runSequence('styles', 'scripts-dist', ['jshint', 'html', 'images', 'fonts', 'copy'], 'fingerprint', 'fingerprint-replace', cb);
});


// Remember to change site variable
gulp.task('mobile', function() {
    return psi(site, {
        // key: key
        nokey: 'true',
        strategy: 'mobile',
    }, function(err, data) {
        console.log('Score: ' + data.score);
        console.log(data.pageStats);
    });
});

gulp.task('desktop', function() {
    return psi(site, {
        nokey: 'true',
        // key: key,
        strategy: 'desktop',
    }, function(err, data) {
        console.log('Score: ' + data.score);
        console.log(data.pageStats);
    });
});

// Load custom tasks from the `tasks` directory
try {
    require('require-dir')('tasks');
} catch (err) {}