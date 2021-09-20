/**
 * @fileoverview prints the current commit/branch's AMP version to stdout.
 *
 * Call as `node build-system/common/version.js`.
 */

const {VERSION} = require('../compile/internal-version');

console /*OK*/
  .log(VERSION);
