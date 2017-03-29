/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var argv = require('minimist')(process.argv.slice(2));
var gulp = require('gulp-help')(require('gulp'));
var util = require('gulp-util');
var webserver = require('gulp-webserver');
// var app = require('../server').app;
var morgan = require('morgan');
var host = argv.host || 'localhost';
var port = argv.port || process.env.PORT || 8000;
var useHttps = argv.https != undefined;
var argv = require('minimist')(process.argv.slice(2));
var watch = require('gulp-watch');
/**
 * Starts a simple http server at the repository root
 */
var server;
var count = 0;
function serve() {
  delete require.cache[require.resolve('../server')];
  delete require.cache[require.resolve('express')];
  var app = require('../server');
  if (!!argv.compiled) {
    process.env.SERVE_MODE = 'min';
    util.log('Serving ' + util.colors.green('compiled') + ' version');
  } else if (argv.cdn) {
    process.env.SERVE_MODE = 'cdn';
    util.log('Serving ' + util.colors.green('cdn') + ' version');
  } else {
    process.env.SERVE_MODE = 'max';
    util.log('Serving ' + util.colors.yellow('max') + ' version');
  }
  if (server) {
    console.log('kill server');
    server.emit('kill');
    server = null;
    app = null;
  }

  server = gulp.src(process.cwd())
    .pipe(webserver({
      port,
      host,
      directoryListing: true,
      https: useHttps,
      middleware: [morgan('dev'), app],
    }));
  console.log(count++);

  gulp.watch(['*/server.js'], ['serve']);

  util.log(util.colors.yellow('Run `gulp build` then go to '
      + getHost() + '/examples/article.amp.max.html'
  ));
  return server;
}





gulp.task(
    'serve',
    'Serves content in root dir over ' + getHost() + '/',
    serve,
    {
      options: {
        'host': '  Hostname or IP address to bind to (default: localhost)',
        'port': '  Specifies alternative port (default: 8000)',
        'https': '  Use HTTPS server (default: false)'
      }
    }
);

function getHost() {
  return (useHttps ? 'https' : 'http') + '://' + host + ':' + port;
}
