/**
 * @fileoverview
 * Gets the order the packages should be published in.
 */

const {getOptimalPublishOrder} = require('./utils');

getOptimalPublishOrder().then(console.log);
