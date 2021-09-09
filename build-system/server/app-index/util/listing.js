'use strict';

const fs = require('fs');
const {join, normalize, sep} = require('path');

/**
 * @param {string} path
 * @param {string} rootPath
 * @return {boolean}
 */
function isMaliciousPath(path, rootPath) {
  return (path + sep).substr(0, rootPath.length) !== rootPath;
}

/**
 * @param {string} rootPath
 * @param {string} basepath
 * @return {Promise<null|undefined|string[]>}
 */
async function getListing(rootPath, basepath) {
  const path = normalize(join(rootPath, basepath));

  if (~path.indexOf('\0')) {
    return null;
  }

  if (isMaliciousPath(path, rootPath)) {
    return null;
  }

  try {
    if (fs.statSync(path).isDirectory()) {
      return fs.promises.readdir(path);
    }
  } catch (unusedE) {
    /* empty catch for fallbacks */
    return null;
  }
}

/**
 * Adds a trailing slash if missing.
 * @param {string} basepath
 * @return {string}
 */
function formatBasepath(basepath) {
  return basepath.replace(/[^\/]$/, (lastChar) => `${lastChar}/`);
}

module.exports = {
  isMaliciousPath,
  getListing,
  formatBasepath,
};
