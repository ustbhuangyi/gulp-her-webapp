'use strict';

var gulp = require('gulp');
var gulpCommand = require('gulp-command')(gulp);
var her = require('gulp-her-kernel');
var browserSync = require('browser-sync');

//prettty
var $ = require('gulp-load-plugins')({
  rename: {
    'gulp-her-beforecompile': 'beforeCompile',
    'gulp-her-aftercompile': 'afterCompile',
    'gulp-her-jswrapper': 'jsWrapper',
    'gulp-her-requireanalyze': 'requireAnalyze',
    'gulp-her-templatebuilder': 'templateBuilder',
    'gulp-her-cssexpand': 'cssExpand',
    'gulp-her-jsexpand': 'jsExpand',
    'gulp-her-package': 'package',
    'gulp-her-outputmap': 'outputmap',
    'gulp-her-csssprite': 'cssSprite'
  }
});

//namespace
var namespace = 'home';
//smarty template dir
var templates = '/template';
// static dir
var statics = '/static';
//release root dir
var dest = 'dist';
//pakage resource dir
var pkgs = '/pkg';

//required
var herconf = {
  namespace: namespace,
  dest: dest,
  useHash: false,
  useDomain: false,
  package: false,
  optimize: false,
  roadmap: {
    ext: {
      coffee: 'js',
      styl: 'css',
      less: 'css',
      sass: 'css'
    },
    domain: ['http://s0.hao123.com/her', 'http://s1.hao123.com/her'],
    //release rules
    path: {
      tpl: {
        src: ['src/**/*.tpl', '!src/smarty/**/*.tpl'],
        release: dest + templates + '/' + namespace,
        url: namespace
      },
      js: {
        src: ['src/**/*.js', '!src/libs/**/*.js'],
        release: dest + statics + '/' + namespace
      },
      css: {
        src: ['src/**/*.css', 'src/**/*.styl', 'src/**/*.less'],
        release: dest + statics + '/' + namespace
      },
      image: {
        src: ['src/**/*.jpg', 'src/**/*.png'],
        release: dest + statics + '/' + namespace
      },
      libjs: {
        src: ['src/libs/Bigpipe/javascript/**/*.js'],
        release: dest + '/libs/Bigpipe/javascript'
      },
      libruntime: {
        src: ['src/libs/Bigpipe/runtime/**/*'],
        release: dest + '/libs/Bigpipe/runtime'
      },
      smarty: {
        src: ['src/libs/smarty/**/*'],
        release: dest + '/libs/smarty'
      },
      testdata: {
        src: ['src/test/**/*'],
        release: dest + '/test/' + namespace
      },
      php: {
        src: ['src/*.php'],
        release: dest
      }
    }
  },
  //pack rules
  pack: [{
    src: ['src/**/*.css', 'src/**/*.styl', '!src/page/index.css'],
    release: dest + statics + '/' + namespace + pkgs + '/aio.css'
  }, {
    src: 'src/resource/Bigpipe/vender/*.js',
    release: dest + statics + '/' + namespace + pkgs + '/vender.js'
  }, {
    src: ['src/widget/**/*.js', 'src/page/**/*.js', 'src/resource/**/*.js', '!src/page/defer.js'],
    release: dest + statics + '/' + namespace + pkgs + '/aio.js'
  }],
  setting: {
    spriter: {
      csssprites: {
        margin: 10
      }
    },
    smarty: {
      left_delimiter: '{%',
      right_delimiter: '%}'
    }
  }
};

//short for herconf.roadmap.path
var path = herconf.roadmap.path;

//required
var ret = {
  ids: {},
  pkg: {},
  map: {
    tpl: {},
    res: {},
    pkg: {}
  }
};

//gulp command support, required
gulp.option(null, '-o, --optimize', 'with optimizing')
  .option(null, '-m, --useHash', 'md5 release option')
  .option(null, '-d, --useDomain', 'add domain name')
  .option(null, '-p, --package', 'with package');

//required
gulp.task('init', function () {
  //set the source code root,required
  her.project.setRoot(process.cwd() + '/src');
  //merge the options to herconf
  her.util.merge(herconf, this.flags);
  //merge herconf to her.config
  her.config.merge(herconf);
});

//compile Bigpipe
gulp.task('js:compile', function () {
  return gulp.src(path.js.src)
    .pipe($.beforeCompile(ret))
    .pipe($.jsWrapper())
    .pipe($.requireAnalyze())
    .pipe($.jsExpand());
});

//compile plugins
gulp.task('libjs:compile', function () {
  return gulp.src(path.libjs.src)
    .pipe($.beforeCompile(ret))
    .pipe($.jsExpand());
});

//compile css
gulp.task('css:compile', function () {
  return gulp.src(path.css.src)
    .pipe($.beforeCompile(ret))
    //if is a stylus file, use stylus plugin to compile
    .pipe($.if(/styl$/, $.stylus({
      errors: true
    })))
    .pipe($.if(/less$/, $.less()))
    .pipe($.cssExpand());
});

//compile tpl
gulp.task('tpl:compile', function () {
  return gulp.src(path.tpl.src)
    .pipe($.beforeCompile(ret))
    .pipe($.templateBuilder.replaceScriptTag())
    .pipe($.templateBuilder.expandPath())
    .pipe($.templateBuilder.analyseScript())
    .pipe($.templateBuilder.defineWidget());
});

//compile image
gulp.task('image:compile', function () {
  gulp.src(path.image.src)
    .pipe($.beforeCompile(ret))
});

//compile image
gulp.task('testdata:copy', function () {
  gulp.src(path.testdata.src)
    .pipe(gulp.dest(path.testdata.release))
});

//copy runtime
gulp.task('libruntime:copy', function () {
  gulp.src(path.libruntime.src)
    .pipe(gulp.dest(path.libruntime.release));
});

//copy smarty
gulp.task('smarty:copy', function () {
  gulp.src(path.smarty.src)
    .pipe(gulp.dest(path.smarty.release));
});


//copy php
gulp.task('php:copy', function () {
  gulp.src(path.php.src)
    .pipe(gulp.dest(path.php.release));
});


//connect server
gulp.task('connect', ['compile'], function () {
  $.connectPhp.server({
    'base': dest,
    'port': 3000
  }, function () {
    browserSync({
      proxy: 'localhost:3000/home/page/index'
    });
  });

  gulp.watch(path.php.src, function () {
    gulp.start('php:copy');
    browserSync.reload();
  });
  gulp.watch(path.js.src, function () {
    reCompile();
  });
  gulp.watch(path.libjs.src, function () {
    reCompile();
  });
  gulp.watch(path.css.src, function () {
    reCompile();
  });
  gulp.watch(path.tpl.src, function () {
    reCompile();
  });
  gulp.watch(path.image.src, function () {
    reCompile();
  });

  function reCompile() {
    gulp.start('default', function () {
      browserSync.reload();
    });
  }
});

//clean dest dir
gulp.task('clean', require('del').bind(null, [dest]));

gulp.task('default', ['clean', 'init'], function () {
  gulp.start('compile');
});

function compileDone() {
  if (her.config.get('package')) {
    $.package(ret);
    $.cssSprite(ret);
  }
  $.outputmap(ret);
  $.afterCompile(ret);
}

gulp.task('compile', [
  'js:compile',
  'css:compile',
  'tpl:compile',
  'image:compile',
  'libjs:compile',
  'testdata:copy',
  'smarty:copy',
  'libruntime:copy',
  'php:copy'
], function () {
  compileDone();
});

gulp.task('serve', ['clean', 'init'], function () {
  gulp.start('connect');
});
