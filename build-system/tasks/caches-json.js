'use strict';

const path = require('path');
const {cyan, green, red} = require('kleur/colors');
const {log, logLocalDev} = require('../common/logging');

const expectedCaches = ['google', 'bing'];
const cachesJsonPath = '../global-configs/caches.json';

/**
 * Entry point for amp caches-jason.
 * @return {Promise<void>}
 */
async function cachesJson() {
  const filename = path.basename(cachesJsonPath);
  let jsonContent;
  try {
    jsonContent = require(cachesJsonPath);
  } catch (e) {
    log(red('ERROR:'), 'Could not parse', cyan(filename));
    process.exitCode = 1;
    return;
  }
  const foundCaches = [];
  for (const foundCache of jsonContent.caches) {
    foundCaches.push(foundCache.id);
  }
  for (const cache of expectedCaches) {
    if (foundCaches.includes(cache)) {
      logLocalDev(green('✔'), 'Found', cyan(cache), 'in', cyan(filename));
    } else {
      log(red('✖'), 'Missing', cyan(cache), 'in', cyan(filename));
      process.exitCode = 1;
    }
  }
}

module.exports = {
  cachesJson,
};

cachesJson.description = 'Check that caches.json contains all expected caches';
