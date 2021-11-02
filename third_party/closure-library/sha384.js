

// Required for calcdeps, but does weird things when compiling.
// goog.provide('__AMP_SHA384_DIGEST');

goog.require('goog.crypt.Sha384');

/**
 * @param {!Uint8Array|string} input The value to hash.
 * @return {!Uint8Array} Web safe base64 of the digest of the input string.
 */
var digest = function(input) {
  var sha384 = new goog.crypt.Sha384();
  sha384.update(input);
  return new Uint8Array(sha384.digest());
}

goog.exportSymbol('__AMP_SHA384_DIGEST', digest, window);
