

const {CONTROL, EXPERIMENT, downloadToDisk} = require('./helpers');
const {startServer, stopServer} = require('../serve');
const HOST = 'localhost';
const PORT = 8000;

/**
 * Download sites specified in config in order to serve them
 * from the file system (to avoid measuring inconsistent
 * node server performance)
 *
 * @return {!Promise}
 * @param {!Array<string>} urls
 */
async function cacheDocuments(urls) {
  await startServer({host: HOST, port: PORT}, {quiet: true}, {minified: true});

  await Promise.all(
    urls.flatMap((url) => [
      downloadToDisk(url, CONTROL),
      downloadToDisk(url, EXPERIMENT),
    ])
  );

  await stopServer();
}

module.exports = cacheDocuments;
