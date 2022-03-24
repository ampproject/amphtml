/**
 * @fileoverview
 * Logs Bento components to publish.
 */

const {getExtensionsAndComponents} = require('./utils');
console /*OK*/
  .log(JSON.stringify(getExtensionsAndComponents()));
