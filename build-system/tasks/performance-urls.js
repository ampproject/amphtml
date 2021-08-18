

const fs = require('fs');
const path = require('path');
const {cyan, green, red} = require('../common/colors');
const {log} = require('../common/logging');

const CONFIG_PATH = './performance/config.json';
const LOCAL_HOST_URL = 'http://localhost:8000/';

/**
 * Entry point for 'amp performance-urls'
 * Check if all localhost urls in performance/config.json exist
 * @return {Promise<void>}
 */
async function performanceUrls() {
  let jsonContent;
  try {
    jsonContent = require(CONFIG_PATH);
  } catch (e) {
    log(red('ERROR:'), 'Could not parse', cyan(CONFIG_PATH));
    process.exitCode = 1;
    return;
  }
  /** @type {string[]} */
  const filepaths = jsonContent.handlers.flatMap((handler) =>
    handler.urls
      .filter((url) => url.startsWith(LOCAL_HOST_URL))
      .map((url) =>
        path.join(__dirname, '../../', url.split(LOCAL_HOST_URL)[1])
      )
  );
  for (const filepath of filepaths) {
    if (!fs.existsSync(filepath)) {
      log(red('ERROR:'), cyan(filepath), 'does not exist');
      process.exitCode = 1;
      return;
    }
  }
  log(green('SUCCESS:'), 'All local performance task urls are valid.');
}

module.exports = {
  performanceUrls,
};

performanceUrls.description = 'Validite config urls for the performance task';
