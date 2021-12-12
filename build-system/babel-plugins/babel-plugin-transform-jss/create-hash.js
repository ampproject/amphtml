const crypto = require('crypto');

// This is in its own file in order to make it easy to stub in tests.
module.exports = {
  createHash: (filepath) =>
    crypto
      .createHash('sha256')
      .update(toPosix(filepath))
      .digest('hex')
      .slice(0, 7),
};

/**
 * To support Windows, use posix separators for all filepath hashes.
 * @param {string} filepath
 * @return {string}
 */
function toPosix(filepath) {
  return filepath.replace(/\\\\?/g, '/');
}
