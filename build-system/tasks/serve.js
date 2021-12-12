'use strict';

const connect = require('gulp-connect');
const debounce = require('../common/debounce');
const fastGlob = require('fast-glob');
const header = require('connect-header');
const minimist = require('minimist');
const morgan = require('morgan');
const open = require('open');
const os = require('os');
const path = require('path');
const {
  lazyBuild3pVendor,
  lazyBuildExtensions,
  lazyBuildJs,
  preBuildExtensions,
  preBuildRuntimeFiles,
} = require('../server/lazy-build');
const {
  SERVER_TRANSFORM_PATH,
  buildNewServer,
} = require('../server/typescript-compile');
const {createCtrlcHandler} = require('../common/ctrlcHandler');
const {cyan, green, red} = require('kleur/colors');
const {logServeMode, setServeMode} = require('../server/app-utils');
const {log} = require('../common/logging');
const {watchDebounceDelay} = require('./helpers');
const {watch} = require('chokidar');

/**
 * @typedef {{
 *   name: string,
 *   port: string,
 *   root: string,
 *   host: string,
 *   debug?: boolean,
 *   silent?: boolean,
 *   https?: boolean,
 *   preferHttp1?: boolean,
 *   liveReload?: boolean,
 *   middleware?: function[],
 *   startedcallback?: function,
 *   serverInit?: function,
 *   fallback?: string,
 *   index: boolean | string | string[],
 * }}
 */
let GulpConnectOptionsDef;

const argv = minimist(process.argv.slice(2), {string: ['rtv']});

const HOST = argv.host || '0.0.0.0';
const PORT = argv.port || '8000';

// Used for logging.
let url = null;
let quiet = !!argv.quiet;

// Used for live reload.
const serverFiles = fastGlob.sync([
  'build-system/server/**',
  `!${SERVER_TRANSFORM_PATH}/dist/**`,
]);

// Used to enable / disable lazy building.
let lazyBuild = false;

/**
 * Returns a list of middleware handler functions to use while serving
 * @return {!Array<function()>}
 */
function getMiddleware() {
  const middleware = [require('../server/app')]; // Lazy-required to enable live-reload
  if (!quiet) {
    middleware.push(morgan('dev'));
  }
  if (argv.cache) {
    middleware.push(header({'cache-control': 'max-age=600'}));
  }
  if (lazyBuild) {
    middleware.push(lazyBuildExtensions);
    middleware.push(lazyBuildJs);
    middleware.push(lazyBuild3pVendor);
  }
  return middleware;
}

/**
 * Launches a server and waits for it to fully start up
 *
 * @param {?Object} connectOptions
 * @param {?Object} serverOptions
 * @param {?Object} modeOptions
 * @return {Promise<void>}
 */
async function startServer(
  connectOptions = {},
  serverOptions = {},
  modeOptions = {}
) {
  await buildNewServer();
  if (serverOptions.lazyBuild) {
    lazyBuild = serverOptions.lazyBuild;
  }
  if (serverOptions.quiet) {
    quiet = serverOptions.quiet;
  }

  let started;
  const startedPromise = new Promise((resolve) => {
    started = resolve;
  });
  setServeMode(modeOptions);

  /** @type {GulpConnectOptionsDef} */
  const options = {
    name: 'AMP Dev Server',
    root: process.cwd(),
    host: HOST,
    port: PORT,
    https: argv.https,
    preferHttp1: true,
    silent: true,
    middleware: getMiddleware,
    ...connectOptions,
  };
  connect.server(options, started);
  await startedPromise;

  /**
   * @param {string} host
   * @return {string}
   */
  function makeUrl(host) {
    return `http${options.https ? 's' : ''}://${host}:${options.port}`;
  }

  url = makeUrl(options.host);
  log(green('Started'), cyan(options.name), green('at:'));
  log('\t', cyan(url));
  for (const device of Object.entries(os.networkInterfaces())) {
    for (const detail of device[1] ?? []) {
      if (detail.family === 'IPv4') {
        log('\t', cyan(makeUrl(detail.address)));
      }
    }
  }
  if (argv.coverage == 'live') {
    const covUrl = `${url}/coverage`;
    log(green('Collecting live code coverage at'), cyan(covUrl));
    await Promise.all([open(covUrl), open(url)]);
  }
  logServeMode();
}

/**
 * Clears server files from the require cache to allow for in-process server
 * live-reload.
 */
function resetServerFiles() {
  for (const serverFile of serverFiles) {
    delete require.cache[path.resolve(serverFile)];
  }
}

/**
 * Stops the currently running server
 * @return {Promise<void>}
 */
async function stopServer() {
  if (url) {
    connect.serverClose();
    log(green('Stopped server at'), cyan(url));
    url = null;
  }
}

/**
 * Closes the existing server and restarts it
 * @return {Promise<void>}
 */
async function restartServer() {
  stopServer();
  try {
    await buildNewServer();
  } catch {
    log(red('ERROR:'), 'Could not rebuild', cyan('AMP Server'));
    return;
  }
  resetServerFiles();
  startServer();
}

/**
 * Performs pre-build steps requested via command line args.
 * @return {Promise<void>}
 */
async function performPreBuildSteps() {
  await preBuildRuntimeFiles();
  await preBuildExtensions();
}

/**
 * Entry point of the `amp serve` task.
 * @return {Promise<void>}
 */
async function serve() {
  await doServe();
}

/**
 * Starts a webserver at the repository root to serve built files.
 * @param {boolean=} lazyBuild
 * @return {Promise<void>}
 */
async function doServe(lazyBuild = false) {
  createCtrlcHandler('serve');
  const watchFunc = async () => {
    await restartServer();
  };
  watch(serverFiles).on('change', debounce(watchFunc, watchDebounceDelay));
  await startServer({}, {lazyBuild}, {});
  if (lazyBuild) {
    await performPreBuildSteps();
  }
}

module.exports = {
  serve,
  doServe,
  startServer,
  stopServer,
  HOST,
  PORT,
};

/* eslint "local/camelcase": 0 */

serve.description = 'Start a webserver at the project root directory';
serve.flags = {
  host: 'Hostname or IP address to bind to (default: localhost)',
  port: 'Specify alternative port (default: 8000)',
  https: 'Use HTTPS server',
  quiet: "Run in quiet mode and don't log HTTP requests",
  cache: 'Make local resources cacheable by the browser',
  no_caching_extensions: 'Disable caching for extensions',
  minified: 'Serve minified JS',
  esm: 'Serve ESM JS (uses the new typescript server transforms)',
  cdn: 'Serve current prod JS',
  rtv: 'Serve JS from the RTV provided',
  coverage:
    'Serve instrumented code to collect coverage info (use --coverage=live to auto-report coverage on page unload)',
};
