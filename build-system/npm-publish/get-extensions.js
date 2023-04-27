/**
 * @fileoverview
 * Logs AMP extensions to publish. Excludes Bento components.
 */

const {getExtensions} = require('./utils');
console /*OK*/
  .log(JSON.stringify(getExtensions()));
