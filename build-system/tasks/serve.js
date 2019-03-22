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
'use strict';

const argv = require('minimist')(process.argv.slice(2));
const colors = require('ansi-colors');
const gulp = require('gulp-help')(require('gulp'));
const log = require('fancy-log');
const nodemon = require('nodemon');

const host = argv.host || 'localhost';
const port = argv.port || process.env.PORT || 8000;
const useHttps = argv.https != undefined;
const quiet = argv.quiet != undefined;
const sendCachingHeaders = argv.cache != undefined;
const noCachingExtensions = argv.noCachingExtensions != undefined;

/**
 * Starts a simple http server at the repository root
 */
function serve() {
  // Get the serve mode
  if (argv.compiled) {
    process.env.SERVE_MODE = 'compiled';
    log(colors.green('Serving minified js'));
  } else if (argv.cdn) {
    process.env.SERVE_MODE = 'cdn';
    log(colors.green('Serving current prod js'));
  } else {
    process.env.SERVE_MODE = 'default';
    log(colors.green('Serving unminified js'));
  }

  // Get if we are offline
  if (argv.offline) {
    process.env.OFFLINE = true;
    log(colors.red(
        'OFFLINE MODE. SERVING DASHBOARD v0 AND EXTENSIONS FROM dist/ .'
    ));
    log(colors.green(
        'Broken extensions in offline mode, will break the dashboard.'
    ));
  }

  const config = {
    script: require.resolve('../server.js'),
    watch: [
      require.resolve('../app.js'),
      require.resolve('../routes/analytics.js'),
      require.resolve('../server.js'),
    ],
    env: {
      'NODE_ENV': 'development',
      'SERVE_PORT': port,
      'SERVE_HOST': host,
      'SERVE_USEHTTPS': useHttps,
      'SERVE_PROCESS_ID': process.pid,
      'SERVE_QUIET': quiet,
      'SERVE_CACHING_HEADERS': sendCachingHeaders,
      'SERVE_EXTENSIONS_WITHOUT_CACHING': noCachingExtensions,
    },
    stdout: !quiet,
  };

  if (argv.inspect) {
    Object.assign(config, {
      execMap: {
        js: 'node --inspect',
      },
    });
  }

  nodemon(config).once('quit', function() {
    log(colors.green('Shutting down server'));
  });
}

process.on('SIGINT', function() {
  process.exit();
});

gulp.task(
    'serve',
    'Serves content in root dir over ' + getHost() + '/',
    serve,
    {
      options: {
        'host': '  Hostname or IP address to bind to (default: localhost)',
        'port': '  Specifies alternative port (default: 8000)',
        'https': '  Use HTTPS server (default: false)',
        'quiet': '  Do not log HTTP requests (default: false)',
        'cache': '  Make local resources cacheable by the browser ' +
            '(default: false)',
        'inspect': '  Run nodemon in `inspect` mode',
        'offline': '  Serve the dashboard using locally built extensions ' +
        'for offline development.',
      },
    }
);

function getHost() {
  return (useHttps ? 'https' : 'http') + '://' + host + ':' + port;
}

exports.serve = serve;
